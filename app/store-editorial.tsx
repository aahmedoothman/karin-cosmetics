import Link from 'next/link';
import {ArrowUpLeft, ArrowUpRight, BookOpen, PackageCheck, Truck} from 'lucide-react';
import type {Language} from '../lib/storefront';
import type {CSSProperties} from 'react';

type DiscoveryShade = {id:string; ar:string; en:string; hex:string};

export function ShadeDiscovery({shades, locale}: {shades:DiscoveryShade[]; locale:Language}) {
  const ar = locale === 'ar';
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return <section className="karin-discovery" aria-labelledby="shade-discovery-title" data-reveal="">
    <div className="k-wrap">
      <div className="k-section-heading">
        <div><span className="karin-editorial-kicker" lang="en">FIND YOUR COLOUR</span>
          <h2 id="shade-discovery-title">{ar ? 'تسوّقي حسب اللون' : 'Shop by colour'}</h2></div>
        <Link className="k-text-link" href={'/'+locale+'/shop'}>{ar ? 'كل الدرجات' : 'All shades'}<Arrow size={17}/></Link>
      </div>
      <div className="karin-shade-strip">
        {shades.map(shade => <Link key={shade.id} href={`/${locale}/products/${shade.id}`} style={{'--shade':shade.hex} as CSSProperties}>
          <span>{ar ? shade.ar : shade.en}</span>
        </Link>)}
      </div>
    </div>
  </section>;
}

export function HomeEditorial({locale}: {locale:Language}) {
  const ar = locale === 'ar';
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return <div className="karin-home-editorial k-wrap">
    <section className="karin-guide-teaser" data-reveal="">
      <BookOpen aria-hidden="true"/>
      <h2>{ar ? 'دليلك لاستخدام اللون' : 'Your colour application guide'}</h2>
      <p>{ar ? 'راجعي خطوات التجهيز والتوزيع والشطف قبل البدء.' : 'Review preparation, application and rinsing before you start.'}</p>
      <Link className="k-button" href={'/'+locale+'/how-to-use'}>{ar ? 'اقرئي الدليل' : 'Read the guide'}<Arrow size={17}/></Link>
    </section>
    <section className="karin-about-teaser" data-reveal="">
      <img src="/assets/optimized/editorial-768.webp" alt="" width={768} height={512} loading="lazy"/>
      <div><span className="karin-editorial-kicker">THE KARIN EDIT</span><h2>{ar ? 'عن كارين' : 'About Karin'}</h2>
        <p>{ar ? 'مجموعة ألوان شعر تمنحك مساحة لاختيار ما يعبّر عن أسلوبك.' : 'A collection of hair colours with room for your own style.'}</p>
        <Link className="k-text-link" href={'/'+locale+'/about'}>{ar ? 'اكتشفي كارين' : 'Discover Karin'}<Arrow size={17}/></Link>
      </div>
    </section>
  </div>;
}

export function ShoppingNotes({locale}: {locale:Language}) {
  const ar = locale === 'ar';
  return <div className="karin-shopping-notes k-wrap">
    <span><PackageCheck size={20} aria-hidden="true"/>{ar ? 'عبوات كارين الأصلية' : 'Original Karin packaging'}</span>
    <span><Truck size={20} aria-hidden="true"/>{ar ? 'توصيل داخل مصر' : 'Delivery across Egypt'}</span>
    <span><BookOpen size={20} aria-hidden="true"/>{ar ? 'الدفع عند الاستلام' : 'Cash on delivery'}</span>
  </div>;
}
