'use client';
import Link from 'next/link';
import {ShoppingBag} from 'lucide-react';
import {currency, productImage, type Language} from '../lib/storefront';

export default function CampaignHero({products, locale}: {products: any[]; locale: Language}) {
  const lineup = ['green', 'purple', 'gray', 'golden-yellow', 'fiery-red', 'brown', 'pink', 'blue', 'blue-black']
    .map(id => products.find(product => product.id === id)).filter(Boolean);
  const prices = products.map(product => product.price);
  const samePrice = prices.length > 0 && prices.every(price => price === prices[0]);
  const ar = locale === 'ar';
  return <section className="campaign-hero">
    <div className="campaign-copy">
      <h1 dir="ltr">Crazy Colours <span>by <em>Karin</em></span></h1>
      <p>{ar ? 'مجموعة ألوان الشعر' : 'The hair colour collection'}</p>
      <h2>{ar ? 'اختَر درجتك المفضّلة' : 'Find your signature colour'}</h2>
      {prices.length > 0 && <p className="campaign-price">{!samePrice && (ar ? 'تبدأ من ' : 'From ')}<strong>{currency(Math.min(...prices), locale)}</strong> <small>{ar ? 'للعبوة' : 'per bottle'}</small></p>}
      <Link className="k-button" href={'/' + locale + '/shop'}><ShoppingBag size={24}/>{ar ? 'تسوّق الآن' : 'Shop now'}</Link>
    </div>
    <div className="campaign-stage" aria-label={ar ? 'مجموعة درجات كارين' : 'Karin shade collection'}>
      <div className="campaign-bottles">{lineup.map((product, index) => {
        const distance = Math.abs(index - (lineup.length - 1) / 2);
        const scale = 1.3 - distance * 0.068;
        return <Link key={product.id} href={'/' + locale + '/products/' + product.id} style={{'--bottle-scale': scale} as React.CSSProperties} aria-label={ar ? product.ar : product.en}><img src={productImage(product.image,480)} alt={ar ? product.ar : product.en} width={164} height={480} loading="eager"/></Link>;
      })}</div>
      <div className="campaign-podium" aria-hidden="true"/>
    </div>
  </section>;
}
