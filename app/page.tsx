
import {redirect} from 'next/navigation';
import {cookies,headers} from 'next/headers';
export const dynamic='force-dynamic';
export default async function Page(){const c=await cookies(),h=await headers();const saved=c.get('karin-language')?.value;redirect('/'+(saved==='en'||(!saved&&h.get('accept-language')?.startsWith('en'))?'en':'ar'));}
