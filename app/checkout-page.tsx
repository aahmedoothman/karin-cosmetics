'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import Checkout from './checkout';
import StoreChrome,{ProductPhoto} from './store-chrome';
import {useStore} from './store-provider';
import {currency,type Language} from '../lib/storefront';

export default function CheckoutPage({initial,lang}:{initial:any;lang:Language}){
  const store=useStore(),router=useRouter(),t=(ar:string,en:string)=>lang==='ar'?ar:en;
  const Arrow=lang==='ar'?ArrowRight:ArrowLeft;
  function back(){router.push('/'+lang+'/shop');store.setBagOpen(true);}
  return <StoreChrome lang={lang} initial={initial} checkout><main id="store-content" className="k-checkout k-wrap"><div className="k-checkout-heading"><Link href={'/'+lang+'/shop'}><Arrow size={16}/>{t('العودة للتسوق','Back to shopping')}</Link><h1>{t('إتمام الطلب','Checkout')}</h1><p className="k-form-caption">{t('اختياراتك في مكان واحد، بخطوات واضحة.','Your selections, a few clear steps away.')}</p></div>
    {!store.ready?<p role="status">{t('جارٍ تحميل بيانات الحقيبة…','Loading your bag…')}</p>:!store.attempt?<div className="k-empty"><h2>{t('راجع اختياراتك أولًا.','Review your selections first.')}</h2><p>{t('ابدأ من الحقيبة لمراجعة السعر والتوافر قبل إتمام الطلب.','Start from your bag to check current prices and availability.')}</p><button className="k-button" onClick={()=>store.setBagOpen(true)}>{t('فتح الحقيبة','Open bag')}</button><Link className="k-text-link" href={'/'+lang+'/shop'}>{t('تسوّق المجموعة','Shop the collection')}</Link></div>:<div className="k-checkout-layout">
      <Checkout lang={lang} attempt={store.attempt} draft={store.draft} onDraft={store.setDraft} frozenCustomer={store.frozenCustomer} freeze={store.freeze} updateAttempt={store.updateAttempt} onSaved={id=>store.finished(id,lang)} onClose={back} onDefiniteFailure={reason=>{store.updateAttempt(null);router.push('/'+lang+'/shop');store.reviewBag(reason);}}/>
      <aside className="k-checkout-summary" aria-label={t('ملخص الطلب','Order summary')}><span className="karin-editorial-kicker">{t('الدفع عند الاستلام','CASH ON DELIVERY')}</span><h2>{t('ملخص الطلب','Order summary')}</h2>{store.attempt.items.map(item=>{const p=initial.products.find((p:any)=>p.id===item.id);return <div className="k-summary-line" key={item.id}><div className="k-summary-item">{p&&<ProductPhoto src={p.image} alt=""/>}<span>{lang==='ar'?item.ar:item.en}<br/><small>× {item.qty}</small></span></div><strong>{currency(item.price*item.qty,lang)}</strong></div>;})}<div className="k-summary-line k-summary-total"><span>{t('إجمالي المنتجات','Products subtotal')}</span><strong>{currency(store.attempt.items.reduce((n,x)=>n+x.price*x.qty,0),lang)}</strong></div><p className="k-summary-shipping">{t('تكلفة الشحن غير مشمولة؛ تُؤكد هاتفيًا قبل التجهيز. الدفع عند الاستلام.','Shipping is not included and is confirmed by phone before preparation. Cash on delivery.')}</p></aside>
    </div>}
  </main></StoreChrome>;
}
