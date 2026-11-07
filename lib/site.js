export const SITE = {
  name: 'NeeksxArt LLC',
  email: 'info@neeksxart.com',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://neeksxart.com').replace(/\/$/, ''),
  socials: {
    instagram: 'https://www.instagram.com/neeksxart/',
    facebook: 'https://www.facebook.com/NEEKSxART/',
    tiktok: 'https://www.tiktok.com/@neeksxart'
  }
};

export const LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'NeeksxArt LLC',
  description: 'Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch for brands, creators and events.',
  address: { '@type': 'PostalAddress', addressLocality: 'Reno', addressRegion: 'NV', addressCountry: 'US' },
  areaServed: 'US',
  sameAs: [
    'https://www.instagram.com/neeksxart/',
    'https://www.facebook.com/NEEKSxART/',
    'https://www.tiktok.com/@neeksxart'
  ]
};
