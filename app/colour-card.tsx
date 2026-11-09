'use client';

import Link from 'next/link';
import {useId, type CSSProperties} from 'react';
import {ShoppingBag} from 'lucide-react';
import {currency, type Language} from '../lib/storefront';
import {ProductPhoto} from './store-chrome';

type Shade = {id:string; ar:string; en:string; hex:string; image:string; price:number; active:boolean};

const strands = Array.from({length: 18}, (_, index) => {
  const offset = index - 8.5;
  return `M -38 ${219 + offset * 3.8}
    C 65 ${264 + offset * 2.9}, 83 ${118 + offset * 1.6}, 158 ${141 + offset * 2.4}
    S 246 ${146 + offset * 3.2}, 339 ${20 + offset * 3.4}`;
});
const ribbon = 'M -38 219 C 65 264, 83 118, 158 141 S 246 146, 339 20';

function HairFlow() {
  const fade = useId();
  return <svg className="k-card-hair" viewBox="0 0 300 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1="0" x2="300">
        <stop stopColor="white" stopOpacity=".08"/>
        <stop offset=".22" stopColor="white" stopOpacity=".82"/>
        <stop offset=".76" stopColor="white"/>
        <stop offset="1" stopColor="white" stopOpacity=".2"/>
      </linearGradient>
      <mask id={fade+'-mask'} maskUnits="userSpaceOnUse" x="-50" y="-60" width="400" height="400">
        <rect x="-50" y="-60" width="400" height="400" fill={`url(#${fade})`}/>
      </mask>
    </defs>
    <g mask={`url(#${fade}-mask)`} fill="none">
      <g className="k-card-flow k-card-flow-soft">
        <path d={ribbon} className="k-card-flow-body" strokeWidth="32"/>
        {strands.map((path, index) => <path key={path} d={path} className={index % 4 === 1 ? 'k-card-strand-shine' : 'k-card-strand'}/>)}
      </g>
      <g className="k-card-flow k-card-flow-main">
        <path d={ribbon} className="k-card-flow-body" strokeWidth="38"/>
        {strands.map((path, index) => <path key={path} d={path} className={index % 4 === 1 ? 'k-card-strand-shine' : 'k-card-strand'}/>)}
      </g>
    </g>
  </svg>;
}

export default function ColourCard({shade, locale, canOrder, ready, onAdd}: {
  shade:Shade; locale:Language; canOrder:boolean; ready:boolean; onAdd:()=>void;
}) {
  const arabic = locale === 'ar';
  const name = arabic ? shade.ar : shade.en;
  const href = `/${locale}/products/${shade.id}`;
  const available = shade.active && canOrder;
  const buyText = available ? (arabic ? 'أضف إلى السلة' : 'Add to cart') : (arabic ? 'غير متاح للطلب' : 'Ordering unavailable');
  return <article className="k-product-card" style={{'--shade':shade.hex} as CSSProperties}>
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
