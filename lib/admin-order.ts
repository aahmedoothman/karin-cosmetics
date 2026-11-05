import {allProducts,db,json,readOrder,now} from './server';
import {normalize,customerErrors,cleanCustomer,transitions} from './commerce';
export async function updateOrder(b:any,actor:string){
 const old=await readOrder(b.id);if(!old)return json({error:'NOT_FOUND'},404);if(b.revision!==old.revision)return json({error:'CONFLICT'},409);
 if(!transitions[old.status]?.includes(b.status))return json({error:'INVALID_TRANSITION'},409);
 const job=await db().prepare("SELECT state FROM shipping_jobs WHERE order_id IN (?,?) AND state IN ('sending','unknown','sent') LIMIT 1").bind(b.id,b.id+'-RETURN').first();
 const dispatched=!!job||!!old.tracking||['shipped','delivered','returned'].includes(old.status);const o={...old};
 const customerChanged=b.customer&&JSON.stringify(cleanCustomer(b.customer))!==JSON.stringify(cleanCustomer(old.customer)),itemsChanged=b.items&&JSON.stringify(b.items)!==JSON.stringify(old.items);
 if(customerChanged||itemsChanged){if(!['pending','confirmed'].includes(old.status)||dispatched)return json({error:'ORDER_LOCKED'},409);
  if(customerChanged){const fields=customerErrors(b.customer);if(Object.keys(fields).length)return json({error:'INVALID',fields},400);o.customer=cleanCustomer(b.customer);}
  if(itemsChanged){if(!Array.isArray(b.items)||!b.items.length||b.items.length>30)return json({error:'INVALID_ITEMS'},400);const ps=await allProducts(),seen=new Set();o.items=[];for(const x of b.items){const previous=old.items.find((p:any)=>p.id===x.id),p=ps.find(p=>p.id===x.id);if(!p||(!p.active&&!previous)||seen.has(x.id)||!Number.isInteger(x.qty)||x.qty<1||x.qty>20)return json({error:'INVALID_ITEMS'},400);seen.add(x.id);o.items.push({id:p.id,ar:p.ar,en:p.en,price:previous?.price??p.price,qty:x.qty});}o.subtotal=o.items.reduce((n:number,x:any)=>n+x.qty*x.price,0);}
 }
 o.shippingFee=b.shippingFee===undefined?old.shippingFee:b.shippingFee;if(o.shippingFee!==null&&(!Number.isFinite(o.shippingFee)||o.shippingFee<0||o.shippingFee>10000))return json({error:'INVALID_FEE',fields:{shippingFee:'fee'}},400);
 for(const key of ['bostaCity','bostaCityId','bostaDistrictId'])o[key]=String(b[key]??old[key]??'').slice(0,100);
 o.tracking=String(b.tracking??old.tracking??'').slice(0,100);o.collected=Number(b.collected??old.collected??0);o.adminNotes=String(b.adminNotes??old.adminNotes??'').slice(0,2000);
 const feeChanged=o.shippingFee!==old.shippingFee,geoChanged=['bostaCity','bostaCityId','bostaDistrictId'].some(k=>(o[k]||'')!==(old[k]||'')),trackingChanged=o.tracking!==(old.tracking||''),collectionChanged=o.collected!==(old.collected||0);
 if(dispatched&&(feeChanged||geoChanged||customerChanged||itemsChanged||trackingChanged||b.phoneConfirm===true))return json({error:'FINANCIAL_OR_SHIPMENT_LOCKED'},409);
 if(!Number.isFinite(o.collected)||o.collected<0||o.collected>o.subtotal+(o.shippingFee||0))return json({error:'INVALID_COLLECTION',fields:{collected:'amount'}},400);
 if(collectionChanged&&!String(b.reason||'').trim())return json({error:'COLLECTION_REASON_REQUIRED'},400);
 o.paymentMethod='cod';o.cod=dispatched?old.cod:(o.shippingFee===null?null:o.subtotal+o.shippingFee-o.collected);o.paymentStatus=o.collected===0?'unpaid':o.shippingFee!==null&&o.collected===o.subtotal+o.shippingFee?'paid':'part_paid';
 if(collectionChanged){o.collectionUpdatedAt=now();o.collectionUpdatedBy=actor;}
 const material=customerChanged||itemsChanged||feeChanged||geoChanged;if(material)o.phoneConfirmedAt=null;
 if(b.phoneConfirm===true){if(o.shippingFee===null)return json({error:'SHIPPING_REQUIRED'},400);o.phoneConfirmedAt=now();o.phoneConfirmedBy=actor;o.confirmedTotal=o.subtotal+o.shippingFee;}
 if(['confirmed','processing','shipped'].includes(b.status)&&!o.phoneConfirmedAt)return json({error:'PHONE_CONFIRM_REQUIRED'},409);
 if(b.status!==old.status&&['cancelled','returned','pending'].includes(b.status)&&!String(b.reason||'').trim())return json({error:'REASON_REQUIRED'},400);
 o.reason=String(b.reason||'').slice(0,500);if(b.status==='pending'&&old.status!=='pending')o.phoneConfirmedAt=null;
 const protect=material||trackingChanged||b.phoneConfirm===true||(!dispatched&&collectionChanged)||(['pending','confirmed','processing'].includes(old.status)&&b.status!==old.status);
 // This predicate is evaluated in the SAME transaction as the update. A previous
 // read of the job is only for the UI error; it cannot authorize a racing write.
 const guard=protect?" AND NOT EXISTS(SELECT 1 FROM shipping_jobs WHERE order_id IN (?,?) AND state IN ('sending','unknown','sent'))":'';const guardArgs=protect?[b.id,b.id+'-RETURN']:[];
 const {id,status,created,revision,...data}=o;
 const history=db().prepare('INSERT INTO revisions(id,entity,entity_id,revision,data,actor,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM orders WHERE id=? AND revision=?'+guard+')').bind(crypto.randomUUID(),'order',id,old.revision,JSON.stringify(old),actor,now(),id,old.revision,...guardArgs);
 const update=db().prepare('UPDATE orders SET data=?,status=?,revision=revision+1,search_text=? WHERE id=? AND revision=?'+guard).bind(JSON.stringify(data),b.status,normalize(id+' '+o.customer.name+' '+o.customer.phone),id,old.revision,...guardArgs);
 const results=await db().batch([history,update,db().prepare('INSERT INTO audit(id,actor,action,created) SELECT ?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),actor,JSON.stringify({event:'order.updated',id,collectionChanged}),now())]);
 if(!results[1].meta.changes)return json({error:'CONFLICT_OR_DISPATCH_LOCKED'},409);return json({ok:true});
}
