import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Droplets, Paintbrush, ShowerHead, Sparkles, Timer} from 'lucide-react';
import StoreChrome from '../../store-chrome';
import {endpointOrigin} from '../../../lib/commerce';
import {publicCatalog} from '../../../lib/public-catalog';

export const dynamic = 'force-dynamic';

const copy = {
  ar: {
    title: 'طريقة الاستخدام',
    description: 'خطوات استخدام ألوان الشعر Karin Crazy Colours، من تجهيز الشعر إلى الشطف.',
    steps: [
      ['اغسلي الشعر', 'اغسلي شعرك جيدًا بشامبو مناسب وجففيه قليلًا.'],
      ['وزّعي الصبغة', 'وزّعي الصبغة بالتساوي على شعر جاف.'],
      ['اتركيها من ٢٠ إلى ٣٠ دقيقة', 'اتركي الصبغة على الشعر لمدة ٢٠–٣٠ دقيقة.'],
      ['اشطفي الشعر', 'اشطفي بالماء فقط حتى يصبح ماء الشطف صافيًا.'],
      ['استمتعي باللون', 'بعد الشطف، صفّفي شعرك بالطريقة التي تفضلينها.'],
    ],
    tipsTitle: 'نصائح أثناء الاستخدام',
    tips: ['ارتدي قفازات عند وضع الصبغة.', 'يُفضّل تطبيقها على شعر فاتح.', 'استخدمي بلسمًا مرطبًا بعد الصبغة.'],
    shop: 'تسوّقي الدرجات',
  },
  en: {
    title: 'How to use',
    description: 'How to apply Karin Crazy Colours hair colour, from preparation to rinsing.',
    steps: [
      ['Wash your hair', 'Wash your hair thoroughly with a suitable shampoo and dry it lightly.'],
      ['Apply the colour', 'Distribute the colour evenly over dry hair.'],
      ['Leave on for 20–30 minutes', 'Allow the colour to sit on your hair for 20–30 minutes.'],
      ['Rinse your hair', 'Rinse with water only until the water runs clear.'],
      ['Enjoy your colour', 'After rinsing, style your hair as desired.'],
    ],
    tipsTitle: 'Application tips',
    tips: ['Wear gloves when applying the colour.', 'For best results, apply to light hair.', 'Use a moisturising conditioner after colouring.'],
    shop: 'Shop the shades',
  },
} as const;

type Params = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {locale} = await params;
  if (locale !== 'ar' && locale !== 'en') return {};
  const {title, description} = copy[locale];
  return {
    title: title + ' | Karin Crazy Colours',
    description,
    alternates: {
      canonical: endpointOrigin + '/' + locale + '/how-to-use',
      languages: {ar: endpointOrigin + '/ar/how-to-use', en: endpointOrigin + '/en/how-to-use'},
    },
  };
}

export default async function HowToUse({params}: Params) {
  const {locale} = await params;
  if (locale !== 'ar' && locale !== 'en') notFound();
  const initial = await publicCatalog();
  const guide = copy[locale];
  const icons = [ShowerHead, Paintbrush, Timer, Droplets, Sparkles];
  const numbers = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en');
  return (
    <StoreChrome initial={initial} lang={locale}>
      <main id="store-content" className="k-guide k-wrap">
        <header className="k-guide-hero">
          <div className="k-guide-intro">
            <span className="k-eyebrow" lang="en">KARIN CRAZY COLOURS</span>
            <h1>{guide.title}</h1>
            <p>{guide.description}</p>
          </div>
          <img src="/assets/bottles/fiery-red-480.webp" width={164} height={480} alt="" fetchPriority="high"/>
        </header>
        <ol className="k-guide-steps" aria-label={guide.title}>
          {guide.steps.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <li key={title}>
                <div className="k-guide-icon" aria-hidden="true"><Icon size={30}/><span>{numbers.format(index + 1)}</span></div>
                <div><h2>{title}</h2><p>{description}</p></div>
              </li>
            );
          })}
        </ol>
        <section className="k-guide-tips" aria-labelledby="guide-tips">
          <h2 id="guide-tips">{guide.tipsTitle}</h2>
          <ul>{guide.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
        </section>
        <Link className="k-button" href={'/' + locale + '/shop'}>{guide.shop}</Link>
      </main>
    </StoreChrome>
  );
}
