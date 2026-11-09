'use client';
import Link from 'next/link';
import {ArrowUpLeft, ArrowUpRight} from 'lucide-react';
import {currency, productImage, type Language} from '../lib/storefront';

type CampaignProduct = {id: string; ar: string; en: string; image: string; price: number; hex: string};

export default function CampaignHero({products, locale}: {products: CampaignProduct[]; locale: Language}) {
  const ar = locale === 'ar';
  const product = products.find(p => p.id === 'burgundy') ?? products[0];
  const prices = products.map(p => p.price);
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return <section className="karin-editorial-hero" aria-labelledby="campaign-title">
    <div className="karin-hero-grid k-wrap">
      <div className="karin-hero-copy">
        <span className="karin-editorial-kicker" lang="en">KARIN / CRAZY COLORS</span>
        <h1 id="campaign-title">{ar ? 'ألوان تعبّر عنك' : 'Colour that feels like you'}</h1>
        <p>{ar ? 'من الدرجات الكلاسيكية إلى الألوان الجريئة، اختاري لونك من مجموعة كارين كريزي كولرز.' : 'From classic tones to vivid shades, find your colour in the Karin Crazy Colors collection.'}</p>
        <div className="karin-hero-actions">
          <Link className="k-button" href={'/'+locale+'/shop'}>{ar ? 'اكتشفي المجموعة' : 'Explore the collection'}<Arrow size={19}/></Link>
          <Link className="karin-editorial-link" href={'/'+locale+'/how-to-use'}>{ar ? 'دليل الاستخدام' : 'Application guide'}</Link>
        </div>
        {prices.length > 0 && <small>{ar ? 'تبدأ العبوة من' : 'From'} <bdi>{currency(Math.min(...prices), locale)}</bdi></small>}
      </div>
      <div className="karin-hero-art">
        <picture className="karin-hero-model" aria-hidden="true">
          <source media="(max-width:760px)" srcSet="/assets/models/M03-480.webp"/>
          <img src="/assets/models/M03-960.webp" alt="" width={960} height={1050} fetchPriority="high"/>
        </picture>
        <span className="karin-hero-orbit" aria-hidden="true"/>
        {product && <Link className="karin-hero-product" href={'/'+locale+'/products/'+product.id} aria-label={ar ? product.ar : product.en}>
          <picture><source media="(max-width:760px)" srcSet={productImage(product.image,320)}/><img src={productImage(product.image,640)} alt="" width={164} height={480}/></picture>
        </Link>}
      </div>
    </div>
  </section>;
}
