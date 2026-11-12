import '@/styles/style.css';
import '@/styles/shop.css';
import '@/styles/studio.css';
import '@/styles/popup.css';
import '@/styles/event.css';
import '@/styles/admin.css';
import '@/styles/responsive.css';
import { SITE } from '@/lib/site';
import { KEYWORDS, pageMeta, siteGraph } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

const base = pageMeta({
  title: 'NeeksxArt LLC | Custom Keychains, Mirrors, Magnets & Buttons — Reno, NV',
  description:
    'Merch people actually keep. Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch, hand-pressed in Reno, NV.'
});

export const metadata = {
  ...base,
  metadataBase: new URL(SITE.url),
  title: base.title.absolute,
  alternates: undefined, // each page sets its own canonical
  applicationName: 'NeeksxArt',
  keywords: KEYWORDS,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'shopping',
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }, { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: '/brand/apple-touch-icon.png'
  },
  // optional: paste the codes from Google Search Console / Bing Webmaster Tools into Vercel env vars
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined
  },
  other: { 'geo.region': 'US-NV', 'geo.placename': 'Reno' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0b0b'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Loaded as a stylesheet (not next/font) because the Merch Studio canvas draws with these exact family names */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;600;700;800&family=Yellowtail&display=swap"
        />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary" />
        <JsonLd data={siteGraph()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
