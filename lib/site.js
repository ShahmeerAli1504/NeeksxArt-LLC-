const socials = {
  instagram: 'https://www.instagram.com/neeksxart/',
  facebook: 'https://www.facebook.com/NEEKSxART/',
  tiktok: 'https://www.tiktok.com/@neeksxart'
};

export const SITE = {
  name: 'NeeksxArt LLC',
  email: 'info@neeksxart.com',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://neeksxart.com').replace(/\/$/, ''),
  description:
    'NeeksxArt LLC is a Reno, Nevada studio that hand-presses custom keychains, mirror keychains, magnets, pin buttons, pocket mirrors and tap-to-connect NFC merch for brands, creators, weddings and events. No minimums, bundle pricing, free local delivery in Reno and Sparks, and nationwide shipping.',
  socials,
  // every official profile, for schema.org sameAs (helps Google + AI engines link them to this site)
  sameAs: [...Object.values(socials), process.env.NEXT_PUBLIC_YELP_URL || 'https://www.yelp.com/biz/neeks-x-art-reno']
};
