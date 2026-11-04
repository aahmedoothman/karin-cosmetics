import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { catalog,defaultSettings } from './catalog';
export const db=()=> (env as any).DB as D1Database;
export const bucket=()=> (env as any).BUCKET as R2Bucket;
export async function isAdmin(){const u=await getChatGPTUser();return u&&(u.email.toLowerCase()==='aahmedoothman@gmail.com'||(import.meta.env.DEV&&u.email==='seedy@sites.test'))?u:null;}
export async function allProducts(){const r=await db().prepare('SELECT data FROM products').all();const m=new Map(catalog.map(p=>[p.id,p]));for(const row of r.results){const p=JSON.parse(row.data as string);m.set(p.id,p);}return [...m.values()];}
export async function settings(){const row=await db().prepare("SELECT data FROM settings WHERE id='shop'").first();return {...defaultSettings,...(row?JSON.parse(row.data as string):{})};}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export async function audit(actor:string,action:string){await db().prepare('INSERT INTO audit(id,actor,action,created) VALUES(?,?,?,?)').bind(crypto.randomUUID(),actor,action,new Date().toISOString()).run();}
export function safeUrl(v:string){if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
