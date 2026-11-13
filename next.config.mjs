/** @type {import('next').NextConfig} */
const pages = 'index|booth|catalog|contact|event|events|favors|magnets|policy|pricing|story|studio|work';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['nodemailer'],
  // lets the /media fallback route read the local photos when deployed without Supabase
  // /api/admin/templates reads the print templates from disk
  outputFileTracingIncludes: {
    '/media/[...path]': ['./supabase/seed-media/**/*'],
    '/api/admin/templates/[file]': ['./print-templates/**/*'],
    '/api/admin/print-sheet': ['./print-templates/keychain-2.25in-round-12up-letter.png', './print-templates/keychain-1.5in-round-15up-letter.png',
      './print-templates/button-1in-round-35up-letter.png', './print-templates/magnet-2.5in-square-6up-letter*.png']
  },
  async redirects() {
    return [
      // old static-site URLs
      { source: '/index.html', destination: '/', permanent: true },
      { source: `/:page(${pages}).html`, destination: '/:page', permanent: true },
      { source: '/about', destination: '/story', permanent: false },
      // old Shopify URLs → matching new pages, so the domain can move over without broken links
      { source: '/pages/about-us', destination: '/story', permanent: true },
      { source: '/pages/contact', destination: '/contact', permanent: true },
      { source: '/pages/estimate-pricing', destination: '/pricing', permanent: true },
      { source: '/pages/events-party-favors', destination: '/favors', permanent: true },
      { source: '/pages/custom-orders-live-magnets-returns-policy', destination: '/policy', permanent: true },
      { source: '/collections/standard-custom-magnets', destination: '/magnets', permanent: true },
      { source: '/collections/catalog', destination: '/catalog', permanent: true },
      { source: '/collections/all', destination: '/catalog', permanent: true },
      { source: '/products/neeksxart-live-magnets', destination: '/events', permanent: true },
      { source: '/products/neeksxart-live-personalized-keychains', destination: '/events', permanent: true },
      { source: '/products/:handle', destination: '/catalog', permanent: true }
    ];
  },
  async headers() {
    return [
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/booth', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] }
    ];
  }
};

export default nextConfig;
