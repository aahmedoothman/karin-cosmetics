
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {catalog,defaultSettings} from './catalog';
export const db=()=> (env as any).DB as D1Database;
export const bucket=()=> (env as any).BUCKET as R2Bucket;
export async function isAdmin(){const u=await getChatGPTUser();return u&&(u.email.toLowerCase()==='aahmedoothman@gmail.com'||(import.meta.env.DEV&&u.email==='seedy@sites.test'))?u:null;}
export const now=()=>new Date().toISOString();
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export function safeUrl(v:string){if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export async function body(req:Request,max=60000){const text=await req.text();if(new TextEncoder().encode(text).length>max)throw new Error('BODY_TOO_LARGE');return JSON.parse(text);}
export async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function diagnostic(operation:string,error:unknown){console.error(JSON.stringify({operation,error:error instanceof Error?error.name:'Unknown',at:now()}));}
export async function allProducts(){const rows=await db().prepare('SELECT id,data,revision FROM products').all();const m=new Map(catalog.map(p=>[p.id,{...p,revision:0,parentId:'karin-colour',contentState:'draft',gallery:[p.image]}]));for(const r of rows.results){const p=JSON.parse(r.data as string);p.gallery=[p.image,...(Array.isArray(p.gallery)?p.gallery:[]).filter((x:string)=>x!==p.image)];m.set(r.id as string,{...p,revision:r.revision});}return [...m.values()] as any[];}
export async function settings(){const row=await db().prepare("SELECT data,revision FROM settings WHERE id='shop'").first();return {...defaultSettings,contentState:'draft',specsAr:'',specsEn:'',usageAr:'',usageEn:'',returnsAr:'',returnsEn:'',video:'',...(row?JSON.parse(row.data as string):{}),revision:row?.revision||0};}
export async function audit(actor:string,action:string){await db().prepare('INSERT INTO audit(id,actor,action,created) VALUES(?,?,?,?)').bind(crypto.randomUUID(),actor,action,now()).run();}
export function history(entity:string,id:string,revision:number,data:any,actor:string){return db().prepare('INSERT INTO revisions(id,entity,entity_id,revision,data,actor,created) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),entity,id,revision,JSON.stringify(data),actor,now());}
export function orderRecord(r:any){return {...JSON.parse(r.data),id:r.id,status:r.status,created:r.created,revision:r.revision};}
export async function readOrder(id:string){const r=await db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first();if(!r)return null;const o=orderRecord(r);o.customer={addressType:'apartment',...o.customer};o.shippingFee??=null;o.collected??=0;return o;}
export async function rateLimit(req:Request){const key=await hash((req.headers.get('cf-connecting-ip')||'local')+':'+Math.floor(Date.now()/3600000));const r=await db().prepare('INSERT INTO limits(id,count,expires) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+3600000).first();return Number(r?.count)<=30;}

