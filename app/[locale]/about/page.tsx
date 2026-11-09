import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {BookOpen, Palette, ShoppingBag} from 'lucide-react';
import StoreChrome from '../../store-chrome';
import {publicCatalog} from '../../../lib/public-catalog';
import {endpointOrigin} from '../../../lib/commerce';

export const dynamic='force-dynamic';

export async function generateMetadata({params}: {params:Promise<{locale:string}>}):Promise<Metadata> {
  const {locale}=await params;
  if (locale!=='ar' && locale!=='en') return {};
  return {
    title:locale==='ar'?'عن كارين | Karin Cosmetics':'About Karin | Karin Cosmetics',
    alternates:{
      canonical:endpointOrigin+'/'+locale+'/about',
      languages:{ar:endpointOrigin+'/ar/about',en:endpointOrigin+'/en/about'},
    },
  };
}

export default async function About({params}: {params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if (locale!=='ar' && locale!=='en') notFound();
  const ar=locale==='ar';
  return <StoreChrome lang={locale} initial={await publicCatalog()}>
    <main id="store-content" className="k-wrap karin-about-page">
      <section className="karin-about-teaser karin-about-hero" aria-labelledby="about-title">
        <picture><source media="(max-width:760px)" srcSet="/assets/optimized/editorial-768.webp"/><img src="/assets/optimized/editorial-1280.webp" alt="" width={1280} height={853}/></picture>
        <div><span className="karin-editorial-kicker" lang="en">KARIN COSMETICS</span>
          <h1 id="about-title">{ar?'عن كارين':'About Karin'}</h1>
          <p>{ar?'تجمع كارين كريزي كولرز درجات كلاسيكية وألوانًا جريئة لتختاري ما يناسب أسلوبك.':'Karin Crazy Colors brings classic tones and vivid shades together so you can choose what suits your style.'}</p>
          <Link className="k-button" href={'/'+locale+'/shop'}>{ar?'اكتشفي المجموعة':'Explore the collection'}</Link>
        </div>
      </section>
      <section className="karin-about-story" aria-labelledby="about-story-title" data-reveal="">
        <span className="karin-editorial-kicker" lang="en">THE CRAZY COLORS COLLECTION</span>
        <h2 id="about-story-title">{ar?'لكل إطلالة لون':'A colour for every look'}</h2>
        <p>{ar?'قد يكون لون الشعر لمسة هادئة أو اختيارًا جريئًا. تصفّحي الدرجات، شاهدي العبوة الأصلية، واقرئي دليل الاستخدام لاختيار اللون الذي يناسبك.':'Hair colour can be a subtle change or a bold choice. Explore the shades, see the original bottle and read the application guide as you choose your colour.'}</p>
        <div className="karin-about-links">
          <Link href={'/'+locale+'/shop'}><Palette size={20}/>{ar?'درجات كارين':'The Karin shades'}</Link>
          <Link href={'/'+locale+'/how-to-use'}><BookOpen size={20}/>{ar?'طريقة الاستخدام':'How to use'}</Link>
          <a href="#assistance"><ShoppingBag size={20}/>{ar?'المساعدة والتواصل':'Help & contact'}</a>
        </div>
      </section>
    </main>
  </StoreChrome>;
}
