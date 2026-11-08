export const productColumns=['id','ar','en','price','hex','image','active','parentId','contentState','descriptionAr','descriptionEn'];

// Strict CSV grammar: a closed quoted field must end at a delimiter.
export function parseCsv(input:string){
  const text=input.replace(/^\uFEFF/,'');
  const rows:string[][]=[];let row:string[]=[],value='',quoted=false,closed=false;
  const field=()=>{row.push(value);value='';closed=false;};
  const finish=()=>{field();if(row.some(v=>v.trim()))rows.push(row);row=[];if(rows.length>501)throw Error('TOO_MANY_ROWS');};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c;continue;}
    if(c===','){field();continue;}
    if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;finish();continue;}
    if(closed)throw Error('INVALID_QUOTES');
    if(c==='"'){if(value!=='')throw Error('INVALID_QUOTES');quoted=true;}else value+=c;
  }
  if(quoted)throw Error('UNCLOSED_QUOTES');finish();return rows;
}

export function productCsv(products:any[]){
  const quote=(v:any)=>'"'+String(v??'').replace(/^[\s]*[=+@-]/,"'$&").replaceAll('"','""')+'"';
  return '\ufeff'+[productColumns.join(','),...products.map(p=>productColumns.map(k=>quote(p[k])).join(','))].join('\r\n');
}

export function previewProducts(text:string,products:any[],families:any[],safeImage:(value:any)=>boolean){
  const parsed=parseCsv(text);if(parsed.length<2)throw Error('EMPTY');
  const headers=parsed.shift()!;
  if(!['id','ar','en','price','hex','image'].every(k=>headers.includes(k))||new Set(headers).size!==headers.length||headers.some(k=>!productColumns.includes(k)))throw Error('HEADERS');
  const seen=new Set<string>();
  return parsed.map((values,index)=>{
    const fields=Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']));
    const old=products.find(p=>p.id===fields.id);
    const active=fields.active?.trim().toLowerCase();
    const product={...(old||{gallery:[],contentState:'draft',active:true,parentId:'karin-colour'}),...fields,price:Number(fields.price),active:active===undefined?old?.active??true:['true','1'].includes(active)};
    const errors:string[]=[];
    if(values.length!==headers.length)errors.push('عدد الأعمدة مختلف');
    if(!/^[a-z0-9-]{1,70}$/.test(product.id)||seen.has(product.id))errors.push('معرّف غير صالح أو مكرر');seen.add(product.id);
    if(active!==undefined&&!['true','false','1','0'].includes(active))errors.push('التوافر يجب أن يكون true أو false أو 1 أو 0');
    if(!product.ar.trim()||!product.en.trim()||product.ar.length>100||product.en.length>100)errors.push('الاسمان مطلوبان، بحد أقصى 100 حرف');
    if(!/^\d+(\.\d{1,2})?$/.test(fields.price.trim())||product.price<1||product.price>100000)errors.push('السعر غير صالح؛ استخدم رقمًا بمنزلتين عشريتين كحد أقصى');
    if(!/^#[0-9a-f]{6}$/i.test(product.hex))errors.push('لون غير صالح');
    if(!safeImage(product.image))errors.push('مسار الصورة غير صالح');
    if(!families.some(f=>f.id===product.parentId))errors.push('المجموعة غير موجودة');
    if(!['draft','approved'].includes(product.contentState))errors.push('حالة المحتوى غير صالحة');
    if(['descriptionAr','descriptionEn'].some(k=>String(product[k]||'').length>3000))errors.push('الوصف يتجاوز 3000 حرف');
    return {line:index+2,product,revision:old?.revision||0,errors};
  });
}
