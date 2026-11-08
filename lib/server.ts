
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {productFamilies} from './families';
import {catalog,defaultSettings} from './catalog';
export const db=()=> (env as any).DB as D1Database;
export const bucket=()=> (env as any).BUCKET as R2Bucket;
export async function isAdmin(){const u=await getChatGPTUser();return u&&(u.email.toLowerCase()==='aahmedoothman@gmail.com'||(import.meta.env.DEV&&u.email==='seedy@sites.test'))?u:null;}
export const now=()=>new Date().toISOString();
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export function safeUrl(v:string){if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export async function body(req:Request,max=60000){const reader=req.body?.getReader();if(!reader)throw Error('EMPTY_BODY');const chunks:Uint8Array[]=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('BODY_TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(bytes));}
export async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function diagnostic(operation:string,error:unknown){const reference=crypto.randomUUID();console.error(JSON.stringify({operation,error:error instanceof Error?error.name:'Unknown',reference,at:now()}));return reference;}
export async function allProducts(){
  const rows=await db().prepare('SELECT id,data,revision FROM products').all();
  const products=new Map(catalog.map(p=>[p.id,{...p,revision:0,parentId:'karin-colour',contentState:'draft',gallery:[p.image]}]));
  for(const row of rows.results){
    const product=JSON.parse(row.data as string);
    const seed=catalog.find(item=>item.id===row.id);
    if(seed){
      const legacyImages=[`/assets/colors/${seed.id}.jpg`,...[320,640,960].map(width=>`/assets/optimized/${seed.id}-${width}.webp`)];
      if(legacyImages.includes(product.image))product.image=seed.image;
      if(seed.id==='golden-yellow'&&product.ar==='أصفر ذهبي'&&String(product.en).toLowerCase()==='golden yellow'){
        product.ar=seed.ar;
        product.en=seed.en;
      }
    }
    product.gallery=[product.image,...(Array.isArray(product.gallery)?product.gallery:[]).filter((image:string)=>image!==product.image)];
    products.set(row.id as string,{...product,revision:row.revision});
  }
  return [...products.values()] as any[];
}
export async function settings(){const row=await db().prepare("SELECT data,revision FROM settings WHERE id='shop'").first();return {...defaultSettings,contentState:'draft',specsAr:'',specsEn:'',usageAr:'',usageEn:'',returnsAr:'',returnsEn:'',video:'',...(row?JSON.parse(row.data as string):{}),revision:row?.revision||0,families:productFamilies(row?JSON.parse(row.data as string).families:undefined)};}
export async function audit(actor:string,action:string){await db().prepare('INSERT INTO audit(id,actor,action,created) VALUES(?,?,?,?)').bind(crypto.randomUUID(),actor,action,now()).run();}
export function history(entity:string,id:string,revision:number,data:any,actor:string){return db().prepare('INSERT INTO revisions(id,entity,entity_id,revision,data,actor,created) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),entity,id,revision,JSON.stringify(data),actor,now());}
export function orderRecord(r:any){return {...JSON.parse(r.data),id:r.id,status:r.status,created:r.created,revision:r.revision};}
export async function readOrder(id:string){const r=await db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first();if(!r)return null;const o=orderRecord(r);o.customer={addressType:'apartment',...o.customer};o.shippingFee??=null;o.collected??=0;return o;}
export async function rateLimit(req:Request){await db().prepare('DELETE FROM limits WHERE expires<?').bind(Date.now()).run();const key=await hash((req.headers.get('cf-connecting-ip')||'local')+':'+Math.floor(Date.now()/3600000));const r=await db().prepare('INSERT INTO limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+3600000).first();return Number(r?.count)<=30;}

