import {notFound} from 'next/navigation';
import Storefront from '../../../storefront';
import {publicCatalog} from '../../../../lib/public-catalog';
import {endpointOrigin} from '../../../../lib/commerce';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;const p=(await publicCatalog()).products.find(p=>p.id===id);if(!p)return {};return {title:'Karin | '+(locale==='en'?p.en:p.ar),alternates:{canonical:`${endpointOrigin}/${locale}/products/${id}`,languages:{ar:`${endpointOrigin}/ar/products/${id}`,en:`${endpointOrigin}/en/products/${id}`}},description:locale==='en'?'Karin '+p.en+' — '+p.price+' EGP per bottle. Shipping is confirmed separately by phone.':'Karin — '+p.ar+' — '+p.price+' ج.م للعبوة. يؤكد الشحن منفصلًا هاتفيًا.',openGraph:{title:'Karin | '+(locale==='en'?p.en:p.ar),locale:locale==='en'?'en_EG':'ar_EG',images:[endpointOrigin+p.image]}};}
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;if(!['ar','en'].includes(locale))notFound();const initial=await publicCatalog();if(!initial.products.some(p=>p.id===id))notFound();return <Storefront initial={initial} locale={locale as 'ar'|'en'} selectedId={id}/>;}
