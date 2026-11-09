import Link from 'next/link';
import {notFound} from 'next/navigation';
import StoreChrome from '../../store-chrome';
import {publicCatalog} from '../../../lib/public-catalog';

export const dynamic='force-dynamic';

export default async function About({params}: {params:Promise<{locale:string}>}) {
  const {locale}=await params;
  if (locale!=='ar' && locale!=='en') notFound();
  const ar=locale==='ar';
  return <StoreChrome lang={locale} initial={await publicCatalog()}>
    <main id="store-content" className="k-wrap karin-about-page">
      <section className="karin-about-teaser">
        <img src="/assets/optimized/editorial-1280.webp" alt="" width={1280} height={853}/>
        <div><span className="karin-editorial-kicker">KARIN COSMETICS</span>
          <h1>{ar?'عن كارين':'About Karin'}</h1>
          <p>{ar?'تجمع كارين كريزي كولرز درجات كلاسيكية وألوانًا جريئة لتختاري ما يناسب أسلوبك.':'Karin Crazy Colors brings classic tones and vivid shades together so you can choose what suits your style.'}</p>
          <Link className="k-button" href={'/'+locale+'/shop'}>{ar?'اكتشفي المجموعة':'Explore the collection'}</Link>
        </div>
      </section>
    </main>
  </StoreChrome>;
}
