import { SITE } from '@/lib/site';
import { media } from '@/lib/media';
import { PRODUCTS, pics } from '@/lib/catalog';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';

// every public, indexable page: [path, priority, changeFrequency]
const PAGES = [
  ['/', 1, 'weekly'],
  ['/catalog', 0.9, 'weekly'],
  ['/pricing', 0.9, 'weekly'],
  ['/studio', 0.8, 'monthly'],
  ['/magnets', 0.8, 'monthly'],
  ['/events', 0.8, 'weekly'],
  ['/favors', 0.8, 'monthly'],
  ['/work', 0.7, 'monthly'],
  ['/reviews', 0.7, 'weekly'],
  ['/story', 0.6, 'yearly'],
  ['/contact', 0.7, 'yearly'],
  ['/policy', 0.4, 'yearly']
];

const abs = u => (/^https?:\/\//.test(u) ? u : SITE.url + u);

export default function sitemap() {
  const lastModified = new Date();
  const productImages = PRODUCTS.flatMap(p => pics(p).slice(0, 1)).map(abs);
  return PAGES.map(([path, priority, changeFrequency]) => ({
    url: SITE.url + (path === '/' ? '' : path),
    lastModified,
    changeFrequency,
    priority,
    images: path === '/catalog' || path === '/pricing' ? productImages : [abs(media(DEFAULT_OG_IMAGE))]
  }));
}
