import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpLeft, ArrowUpRight, Droplets, Paintbrush, ShowerHead, Sparkles, Timer} from 'lucide-react';
import StoreChrome from '../../store-chrome';
import {endpointOrigin} from '../../../lib/commerce';
import {publicCatalog} from '../../../lib/public-catalog';
import {productImage} from '../../../lib/storefront';

export const dynamic = 'force-dynamic';

const copy = {
  ar: {
    title: 'طريقة الاستخدام',
    description: 'خطوات استخدام ألوان الشعر Karin Crazy Colours، من تجهيز الشعر إلى الشطف.',
    steps: [
      ['اغسلي الشعر', 'اغسلي شعرك جيدًا بشامبو مناسب وجففيه قليلًا.'],
      ['وزّعي الصبغة', 'وزّعي الصبغة بالتساوي على شعر جاف.'],
      ['مدة الانتظار', 'راجعي مدة الانتظار على عبوتك قبل البدء.'],
      ['اشطفي وصفّفي', 'اشطفي بالماء فقط حتى يصبح صافيًا، ثم صفّفي شعرك بالطريقة التي تفضلينها.'],
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
      ['Processing time', 'Check the processing time on your bottle before you begin.'],
      ['Rinse and style', 'Rinse with water only until it runs clear, then style as desired.'],
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
  const icons = [ShowerHead, Paintbrush, Timer, Droplets];
  const ar = locale === 'ar';
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  const product = initial.products.find(p => p.id === 'fiery-red') ?? initial.products[0];
  const numbers = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en');
  return (
    <StoreChrome initial={initial} lang={locale}>
      <main id="store-content" className="k-guide karin-application k-wrap">
        <header className="k-guide-hero">
          <div className="k-guide-intro">
            <span className="k-eyebrow" lang="en">KARIN CRAZY COLOURS</span>
            <h1>{guide.title}</h1>
            <p>{guide.description}</p>
            <a className="k-button" href="#application-steps">{ar ? 'خطوات الاستخدام' : 'See the steps'}</a>
          </div>
          {product && <img src={productImage(product.image,640)} width={164} height={480} alt="" fetchPriority="high"/>}
        </header>
        <ol id="application-steps" className="k-guide-steps" aria-label={guide.title}>
          {guide.steps.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <li key={title} data-reveal={index}>
                <div className="k-guide-icon" aria-hidden="true"><Icon size={30}/><span>{numbers.format(index + 1)}</span></div>
                <div><h2>{title}</h2><p>{description}</p></div>
              </li>
            );
          })}
        </ol>
        <aside className="karin-guide-duration" aria-labelledby="duration-title" data-reveal="">
          <Timer size={40} aria-hidden="true"/>
          <div><h2 id="duration-title">{ar ? 'مدة الانتظار المقترحة' : 'Proposed processing time'}</h2>
            <strong><bdi dir="ltr">{numbers.format(40)}–{numbers.format(50)}</bdi> {ar ? 'دقيقة' : 'minutes'}</strong>
            <p>{ar ? 'المدة قيد التحقق قبل النشر. اتبعي التعليمات المطبوعة على عبوتك.' : 'Pending verification before release. Follow the directions printed on your bottle.'}</p>
          </div>
        </aside>
        <section className="k-guide-tips" aria-labelledby="guide-tips" data-reveal="">
          <h2 id="guide-tips"><Sparkles size={21} aria-hidden="true"/>{guide.tipsTitle}</h2>
          <ul>{guide.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
        </section>
        <Link className="k-button" href={'/' + locale + '/shop'}>{guide.shop}<Arrow size={18}/></Link>
      </main>
    </StoreChrome>
  );
}
