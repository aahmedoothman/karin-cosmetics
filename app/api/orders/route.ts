import {allProducts,settings,db,json,sameOrigin} from '../../../lib/server';
import {governorates} from '../../../lib/catalog';
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'FORBIDDEN'},403);
 try{
 if(Number(req.headers.get('content-length')||0)>20000)return json({error:'INVALID'},400);
 const b=await req.json() as any;const c=b.customer||{};const clean=(v:any,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
 const phone=clean(c.phone,30).replace(/[٠-٩]/g,(x:string)=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(x))).replace(/[\s()-]/g,'').replace(/^\+?20/,'0');
 if(!/^[a-f0-9-]{36}$/i.test(b.requestKey||'')||!b.consent||b.website||clean(c.name,100).length<5||!/^01[0125]\d{8}$/.test(phone)||!governorates.includes(c.governorate)||clean(c.city,100).length<2||clean(c.street,200).length<5||!clean(c.building,50)||!clean(c.floor,50)||!clean(c.apartment,50)||!Array.isArray(b.items)||!b.items.length||b.items.length>30)return json({error:'INVALID'},400);
 const existing=await db().prepare('SELECT id FROM orders WHERE request_key=?').bind(b.requestKey).first();if(existing)return json({id:existing.id});
 const s=await settings();if(!s.acceptOrders)return json({error:'PAUSED'},409);
 const products=await allProducts();const seen=new Set();let total=0;const items=[];
 for(const item of b.items){const p=products.find(x=>x.id===item.id&&x.active);if(!p||seen.has(item.id)||!Number.isInteger(item.qty)||item.qty<1||item.qty>20)return json({error:'PRODUCT_CHANGED'},409);if(item.price!==p.price)return json({error:'PRICE_CHANGED'},409);seen.add(item.id);items.push({id:p.id,ar:p.ar,en:p.en,qty:item.qty,price:p.price});total+=p.price*item.qty;}
 const ip=req.headers.get('cf-connecting-ip')||'local';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip));const key=Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('')+':'+Math.floor(Date.now()/3600000);
 await db().prepare('DELETE FROM limits WHERE expires<?').bind(Date.now()).run();
 const count=await db().prepare('INSERT INTO limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+3600000).first();if(Number(count?.count)>8)return json({error:'RATE_LIMIT'},429);
 const id='KR-'+crypto.randomUUID().slice(0,8).toUpperCase();const created=new Date().toISOString();
 const data={items,subtotal:total,shippingFee:s.shippingFee,customer:{name:clean(c.name,100),phone,whatsapp:!!c.whatsapp,email:clean(c.email,150),governorate:c.governorate,city:clean(c.city,100),street:clean(c.street,200),building:clean(c.building,50),floor:clean(c.floor,50),apartment:clean(c.apartment,50),landmark:clean(c.landmark,200),notes:clean(c.notes,1000)},consentAt:created,tracking:'',shippingStatus:'not_sent',paymentStatus:'unpaid'};
 await db().prepare('INSERT INTO orders(id,request_key,data,status,created) VALUES(?,?,?,?,?)').bind(id,b.requestKey,JSON.stringify(data),'pending',created).run();return json({id},201);
 }catch{return json({error:'SAVE_FAILED'},503);}
}
