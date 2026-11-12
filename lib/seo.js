/* =========================================================
   SEO + AEO (answer-engine) helpers
   - pageMeta():  full Next.js metadata for a page (canonical, Open Graph, Twitter, robots)
   - JSON-LD builders: the business graph, breadcrumbs, FAQs, products, services
   Every indexable page uses these so Google and AI assistants (ChatGPT, Claude,
   Perplexity, Gemini) get the same clean, consistent facts about the business.
   ========================================================= */
import { SITE } from './site.js';
import { media } from './media.js';
import { PRODUCTS, pics, singleTier, bundlesFor } from './catalog.js';

export const DEFAULT_OG_IMAGE = 'img/neeks-studio.jpg';
const abs = path => (/^https?:\/\//.test(path) ? path : SITE.url + (path.startsWith('/') ? path : '/' + path));

export const KEYWORDS = [
  'custom keychains', 'custom mirror keychains', 'custom magnets', 'custom photo magnets',
  'custom pin buttons', 'NFC keychains', 'tap to connect keychain', 'custom pocket mirrors',
  'custom merch Reno', 'party favors Reno', 'wedding favors', 'event pop-up photo magnets',
  'promotional products Reno NV', 'NeeksxArt'
];

/**
 * Full metadata for one page. Next.js replaces (does not merge) `openGraph` and `twitter`
 * from the root layout, so every page gets the complete set here.
 */
export function pageMeta({ title, description, path = '/', image = DEFAULT_OG_IMAGE, imageAlt, noindex = false, keywords }) {
  const img = media(image);
  const alt = imageAlt || 'NeeksxArt studio in Reno, NV: custom keychains, magnets, mirrors and buttons';
  return {
    title: { absolute: title },
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'en_US',
      url: path,
      title,
      description,
      images: [{ url: img, ...(image === DEFAULT_OG_IMAGE ? { width: 1552, height: 942 } : {}), alt }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: img, alt }] }
  };
}

/* ---------- JSON-LD ---------- */
export const ORG_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** Business + website graph, rendered once in the root layout */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'Store'],
        '@id': ORG_ID,
        name: SITE.name,
        alternateName: ['NeeksxArt', 'Neeks x Art', 'NEEKSxART'],
        legalName: 'NeeksxArt LLC',
        url: SITE.url,
        email: SITE.email,
        logo: { '@type': 'ImageObject', url: abs('/brand/neeksxart-logo-black.png') },
        image: abs(media(DEFAULT_OG_IMAGE)),
        description: SITE.description,
        slogan: 'Merch people actually keep.',
        priceRange: '$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Credit card, debit card',
        address: { '@type': 'PostalAddress', addressLocality: 'Reno', addressRegion: 'NV', addressCountry: 'US' },
        areaServed: [
          { '@type': 'City', name: 'Reno, NV' },
          { '@type': 'City', name: 'Sparks, NV' },
          { '@type': 'Country', name: 'United States' }
        ],
        knowsAbout: [
          'Custom keychains', 'Mirror keychains', 'Custom magnets', 'Pin buttons',
          'NFC tap-to-connect keychains', 'Pocket mirrors', 'Party favors', 'Live event pop-ups'
        ],
        contactPoint: {
          '@type': 'ContactPoint', contactType: 'customer service', email: SITE.email,
          areaServed: 'US', availableLanguage: ['English']
        },
        sameAs: SITE.sameAs
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en-US',
        publisher: { '@id': ORG_ID }
      }
    ]
  };
}

/** crumbs: [['Catalog', '/catalog'], ...] — Home is added automatically */
export function breadcrumbs(crumbs) {
  const all = [['Home', '/'], ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) }))
  };
}

/** WebPage node tying a page to the business (helps AI engines attribute content) */
export function webPage({ type = 'WebPage', name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name,
    description,
    inLanguage: 'en-US',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID }
  };
}

/** faqs: [{ q, a }] with plain-text answers */
export function faqPage(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
}

/** one Product with an AggregateOffer spanning its single price and bundle prices */
export function productNode(p) {
  const each = [p.tiers[0][1], ...bundlesFor(p).map(b => b.each)];
  return {
    '@type': 'Product',
    '@id': `${SITE.url}/catalog#${p.id}`,
    name: p.name,
    description: p.desc,
    category: p.group,
    sku: p.id,
    image: pics(p).map(abs),
    brand: { '@type': 'Brand', name: 'NeeksxArt' },
    manufacturer: { '@id': ORG_ID },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...each).toFixed(2),
      highPrice: Math.max(...each).toFixed(2),
      offerCount: each.length,
      availability: 'https://schema.org/MadeToOrder',
      url: `${SITE.url}/catalog`,
      seller: { '@id': ORG_ID }
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Single price', value: `$${singleTier(p).each.toFixed(2)} each` },
      ...bundlesFor(p).map(b => ({ '@type': 'PropertyValue', name: `${b.qty}-pack`, value: `$${b.price.toFixed(2)} ($${b.each.toFixed(2)} each)` }))
    ]
  };
}

/** ItemList of products (catalog / magnets pages) */
export function productList(ids, name = 'NeeksxArt custom merch catalog') {
  const list = ids ? PRODUCTS.filter(p => ids.includes(p.id)) : PRODUCTS;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productNode(p) }))
  };
}

/** a Service the business offers (events, favors, design help) */
export function service({ name, description, path, serviceType }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url: abs(path),
    provider: { '@id': ORG_ID },
    areaServed: [{ '@type': 'City', name: 'Reno, NV' }, { '@type': 'City', name: 'Sparks, NV' }, { '@type': 'Country', name: 'United States' }]
  };
}
