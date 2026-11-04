import {notFound} from 'next/navigation';
import Storefront from '../storefront';
import {publicCatalog} from '../../lib/public-catalog';
import {endpointOrigin} from '../../lib/commerce';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;const title=locale==='en'?'Karin Cosmetics | Hair colour collection':'Karin Cosmetics | مجموعة ألوان الشعر';return {title,alternates:{canonical:endpointOrigin+'/'+locale,languages:{ar:endpointOrigin+'/ar',en:endpointOrigin+'/en'}},openGraph:{title,images:[endpointOrigin+'/assets/editorial-refined.jpg']}};}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!['ar','en'].includes(locale))notFound();try{return <Storefront initial={await publicCatalog()} locale={locale as 'ar'|'en'}/>;}catch{return <main className="access-page"><h1>المتجر غير متاح مؤقتًا / Store temporarily unavailable</h1><a href={'/'+locale}>إعادة المحاولة / Retry</a></main>;}}
