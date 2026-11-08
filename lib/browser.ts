// Receipt secrets and attempt identifiers may be stored; customer details never are.
const memory=new Map<string,string>();
export function readSession(key:string){try{return sessionStorage.getItem(key)??memory.get(key)??null;}catch{return memory.get(key)??null;}}
export function writeSession(key:string,value:string){memory.set(key,value);try{sessionStorage.setItem(key,value);return true;}catch{return false;}}
export function removeSession(key:string){memory.delete(key);try{sessionStorage.removeItem(key);}catch{}}
export function writePreference(key:string,value:string){try{localStorage.setItem(key,value);}catch{}}
export function lastReceiptLink(){
  let saved:string|null=null;
  try{saved=localStorage.getItem('karin-saved-receipt');}catch{}
  return [readSession('karin-last-receipt'),saved].find(link=>link&&/^\/receipt\/[A-Z0-9-]+\?lang=(ar|en)#[a-f0-9]{64}$/i.test(link))||'';
}
export async function copyText(value:string){try{if(!navigator.clipboard?.writeText)return false;await navigator.clipboard.writeText(value);return true;}catch{return false;}}
export type CartLine={id:string;qty:number;ar?:string;en?:string};
export function mergeCart(lines:CartLine[],item:CartLine){const total=lines.filter(x=>x.id===item.id).reduce((n,x)=>n+x.qty,0)+item.qty;if(total>20)return null;return [...lines.filter(x=>x.id!==item.id),{...item,qty:total}];}
export function metric(event:string,product=''){try{void fetch('/api/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,product}),keepalive:true}).catch(()=>{});}catch{}}
