import '@/styles/style.css';
import '@/styles/shop.css';
import '@/styles/studio.css';
import '@/styles/popup.css';
import '@/styles/event.css';
import '@/styles/admin.css';
import '@/styles/responsive.css';
import { SITE, LOCAL_BUSINESS } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: 'NeeksxArt LLC | Custom Keychains, Mirrors, Magnets & Buttons — Reno, NV',
  description:
    'Merch people actually keep. Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch, hand-pressed in Reno, NV.',
  icons: { icon: '/favicon.png' },
  openGraph: { type: 'website', siteName: 'NeeksxArt LLC' }
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
