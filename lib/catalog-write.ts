// Both sides of the relationship are guarded inside the actual write statement,
// so a concurrent collection edit cannot orphan an archived or active product.
export const familyExistsSql=`EXISTS (
  SELECT 1 FROM json_each(COALESCE(
    (SELECT CASE WHEN json_type(data,'$.families')='array' AND json_array_length(data,'$.families')>0
      THEN json_extract(data,'$.families') END FROM settings WHERE id='shop'),
    '[{"id":"karin-colour"}]'
  )) AS family WHERE json_extract(family.value,'$.id')=?
)`;

export const familiesRetainProductsSql=`NOT EXISTS (
  SELECT 1 FROM products AS product WHERE NOT EXISTS (
    SELECT 1 FROM json_each(?,'$.families') AS family
    WHERE json_extract(family.value,'$.id')=COALESCE(NULLIF(json_extract(product.data,'$.parentId'),''),'karin-colour')
  )
)`;

export function productWrite(database:any,product:any,revision:number,updated:string){
  const data=JSON.stringify(product);
  return revision
    ?database.prepare('UPDATE products SET data=?,revision=revision+1,updated=? WHERE id=? AND revision=? AND '+familyExistsSql).bind(data,updated,product.id,revision,product.parentId)
    :database.prepare('INSERT OR IGNORE INTO products(id,data,updated,revision) SELECT ?,?,?,1 WHERE '+familyExistsSql).bind(product.id,data,updated,product.parentId);
}

export function settingsWrite(database:any,settings:any,revision:number){
  const data=JSON.stringify(settings);
  return revision
    ?database.prepare("UPDATE settings SET data=?,revision=revision+1 WHERE id='shop' AND revision=? AND "+familiesRetainProductsSql).bind(data,revision,data)
    :database.prepare("INSERT OR IGNORE INTO settings(id,data,revision) SELECT 'shop',?,1 WHERE "+familiesRetainProductsSql).bind(data,data);
}

// Must immediately follow its guarded write in the same D1 batch transaction.
export function catalogHistory(database:any,entity:string,id:string,revision:number,previous:any,actor:string,created:string){
  return database.prepare('INSERT INTO revisions(id,entity,entity_id,revision,data,actor,created) SELECT ?,?,?,?,?,?,? WHERE changes()=1')
    .bind(crypto.randomUUID(),entity,id,revision,JSON.stringify(previous),actor,created);
}
