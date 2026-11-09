'use client';

import Link from 'next/link';
import {type CSSProperties} from 'react';
import {ShoppingBag} from 'lucide-react';
import {currency, type Language} from '../lib/storefront';
import {ProductPhoto} from './store-chrome';

type Shade = {id:string; ar:string; en:string; hex:string; image:string; price:number; active:boolean};

export function HairFlow() {
  return <span className="karin-hair-texture" aria-hidden="true">
    <span className="k-card-flow k-card-flow-soft"/>
    <span className="k-card-flow k-card-flow-main"/>
  </span>;
}

export default function ColourCard({shade, locale, canOrder, ready, onAdd, order}: {
  shade:Shade; locale:Language; canOrder:boolean; ready:boolean; onAdd:()=>void; order:number;
}) {
  const arabic = locale === 'ar';
  const name = arabic ? shade.ar : shade.en;
  const href = `/${locale}/products/${shade.id}`;
  const available = shade.active && canOrder;
  const buyText = available ? (arabic ? 'أضف إلى السلة' : 'Add to cart') : (arabic ? 'غير متاح للطلب' : 'Ordering unavailable');
  return <article className="k-product-card" data-reveal={order} style={{'--shade':shade.hex} as CSSProperties}>
    <Link className="k-product-image" href={href} tabIndex={-1} aria-hidden="true">
      <HairFlow/>
      <ProductPhoto src={shade.image} alt="" card/>
    </Link>
    <div className="k-card-info">
      <h3><Link href={href}>{name}</Link></h3>
      <strong>{currency(shade.price,locale)}</strong>
    </div>
    <button className="k-card-add" type="button" onClick={onAdd} disabled={!available || !ready}
      aria-label={available ? `${buyText} — ${name}` : undefined}>
      <ShoppingBag size={16} aria-hidden="true"/><span>{buyText}</span>
    </button>
  </article>;
}
