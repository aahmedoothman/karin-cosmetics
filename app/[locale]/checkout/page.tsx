import {notFound} from 'next/navigation';
import CheckoutPage from '../../checkout-page';
import {publicCatalog} from '../../../lib/public-catalog';
export const dynamic='force-dynamic';
export const metadata={title:'Karin | Checkout — إتمام الطلب',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;if(locale!=='ar'&&locale!=='en')notFound();
  return <CheckoutPage initial={await publicCatalog()} lang={locale}/>;
}
