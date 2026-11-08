export type Language = 'ar' | 'en';
export const maxOrderLines = 30;
export const shadeAliases: Record<string, string> = {
  purple: 'بنفسجي بنفسجى موف violet mauve',
  'blue-black': 'اسود ازرق اسود مزرق كحلي midnight navy',
  'golden-yellow': 'ذهبي دهبي اصفر gold yellow',
  burgundy: 'نبيتي عنابي خمري wine red',
  'fiery-red': 'احمر ناري red scarlet',
  pink: 'بينك وردي pink rose',
  fuchsia: 'فوشيا فوشيه فوشي magenta',
  'red-mauve': 'احمر موف plum red',
  violet: 'بنفسجي بنفسجى violet purple',
  gray: 'رصاصي فضي سيلفر grey silver',
  aubergine: 'باذنجاني بتنجاني eggplant',
};
export function currency(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency', currency: 'EGP', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value);
}
export function productImage(source: string, width = 640) {
  const bottle = source.match(/^\/assets\/bottles\/([a-z-]+)\.png$/)?.[1];
  if (bottle) return '/assets/bottles/' + bottle + '-' + (width <= 320 ? 240 : width <= 640 ? 480 : 720) + '.webp';
  const original = source.match(/^\/assets\/colors\/([a-z-]+)\.jpg$/)?.[1];
  return original ? `/assets/optimized/${original}-${width}.webp` : source;
}
export function filterState(search: string) {
  const q = new URLSearchParams(search);
  return { q: q.get('q') || '', family: q.get('family') || '', max: q.get('max') || '',
    sort: ['featured', 'price-asc', 'price-desc', 'name'].includes(q.get('sort') || '') ? q.get('sort')! : 'featured' };
}
export function filterQuery(state: ReturnType<typeof filterState>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) if (value && !(key === 'sort' && value === 'featured')) q.set(key, value);
  return q.size ? '?' + q.toString() : '';
}
// All widgets in a product template share the current product. Explicit missing
// bindings remain unavailable rather than silently purchasing another item.
export function boundProduct(products: any[], selected: any, id?: string) {
  return id ? products.find(p => p.id === id) : selected;
}
