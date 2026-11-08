/* =========================================================
   NeeksxArt catalog + pricing (single source of truth)
   Prices match the NeeksxArt price sheet (effective Nov 1, 2026).
   Edit a product here and every page updates:
   - tiers:   [min qty, price each]  (a tier runs until the next min)
   - packs:   optional fixed pack prices
   - special: true = design consultation / email before ordering
   - imgs:    photos in the Supabase `site-media` bucket under catalog/
              (originally from the old Shopify store; `npm run media:upload` copies them)
   - local:   photos in the Supabase `site-media` bucket under img/
   ========================================================= */
import { media, USING_SUPABASE } from './media.js';
import { BUNDLES } from './bundles.js';

export const EMAIL = 'info@neeksxart.com';

export const PRODUCTS = [
  { id: 'mag25', group: 'Magnets', name: '2.5-inch Square Magnets', short: 'Standard custom pricing',
    desc: 'Our signature square photo and logo magnets. Glossy, bold and built to live on the fridge for years. Free digital mockup before anything is printed.',
    studio: 'magnet', collection: ['magnets'], tag: 'Best seller',
    tiers: [[1, 6], [10, 5.5], [25, 4.75], [50, 4], [100, 3.5], [250, 2.75]],
    packs: [[10, 55], [25, 118.75], [50, 200], [100, 350], [250, 687.5]],
    imgs: ['1657F592-FD8E-4414-B721-BC966EBF46E9.png?v=1792660584', 'IMG_5584.png?v=1791809165', 'E159D128-EFBD-4295-87F3-F221B6D8ADBD.jpg?v=1792031283', 'C80D7051-3B56-4474-9024-26056A097B7E_1_102_o.jpg?v=1792031283', 'A68EF4F0-7798-4A98-BF58-839860AE70BE.png?v=1792031283', '58FD260A-742D-42DD-A6B7-348BF7BA7237.png?v=1792031284', 'FB911656-9950-4002-8651-09584AFC2C1E.png?v=1792031283'] },
  { id: 'mag225', group: 'Magnets', name: '2.25-inch Circular Magnets', short: 'Round glossy magnets',
    desc: 'Round, domed magnets for logos, photos and party favors. No minimum, with better pricing as your quantity grows.',
    studio: 'magnet', collection: ['magnets'],
    tiers: [[1, 5], [10, 4.5], [25, 4], [50, 3.5], [100, 3]],
    imgs: ['dji_mimo_20260902_203854_20260902203853_1788409166260_photo.jpg?v=1792030020', '87DC9E8B-814D-48D0-A085-8D4F1F9DBB7D.png?v=1792030016'] },
  { id: 'btn1', group: 'Pin buttons', name: '1-inch Pin Buttons', short: 'Mini pin-back buttons',
    desc: 'Small, punchy pin-backs for jackets, lanyards, merch tables and giveaways.',
    studio: 'button', collection: [],
    tiers: [[1, 1.5], [25, 1], [50, 0.85], [100, 0.7], [250, 0.6]],
    imgs: ['IMG_5597.png?v=1791857737', 'IMG_5596.png?v=1791857737'] },
  { id: 'btn225', group: 'Pin buttons', name: '2.25-inch Pin Buttons', short: 'Classic statement buttons',
    desc: 'The classic button size. Big enough for full artwork, photos and campaign logos.',
    studio: 'button', collection: [],
    tiers: [[1, 3], [25, 2], [50, 1.75], [100, 1.5], [250, 1.25]],
    local: ['img/logo-button.jpg'] },
  { id: 'kc15', group: 'Keychains', name: '1.5-inch Standard Keychains', short: 'No minimum',
    desc: 'Compact domed keychains with split ring. The thing nobody throws away: their keys.',
    studio: 'keychain', collection: [],
    tiers: [[1, 4], [10, 3.75], [25, 3.25], [50, 2.75], [100, 2.5]],
    packs: [[10, 37.5], [25, 81.25], [50, 137.5], [100, 250]],
    imgs: ['F61CCAD8-25F2-49BA-85C9-70CC084B269C.png?v=1792375444', 'D03623F6-0AD3-463A-988D-0C7E9E064EBE.png?v=1792375442', '488D516D-6D25-4451-BE2D-A66515E540FC.png?v=1792375447', '3F0CBAFD-98EB-42E9-AF3E-FFB8E7EAE4C1.png?v=1792375453', '8779BEA2-1C65-4165-872C-21C71E28F9F8.png?v=1792375458'] },
  { id: 'kc225', group: 'Keychains', name: '2.25-inch Standard Metal Keychains', short: 'Full-size metal keychains',
    desc: 'Full-size metal keychains with room for detailed logos and photos.',
    studio: 'keychain', collection: [],
    tiers: [[1, 5], [10, 4.75], [25, 4.25], [50, 3.75], [100, 3]],
    local: ['img/nextlevel-2.jpg', 'img/nextlevel-1.jpg'] },
  { id: 'mirror225', group: 'Mirror keychains', name: '2.25-inch Custom Mirror Keychains', short: 'Full package', special: true, tag: 'Full package',
    desc: 'Your design on the front, a real mirror on the back. Every order includes matching backer cards, a Sandy Mylar finish, your tassel color, gold or silver hardware and individual cello packaging.',
    studio: 'mirror', collection: [],
    tiers: [[1, 10], [10, 8.5], [20, 7.5], [50, 7], [100, 6.5]],
    imgs: ['2A7090E1-1C75-450B-9070-3E9F3780C728.png?v=1792375561', 'E9B09DDF-0EB3-4B0C-BAE4-999A16DC3DD5.png?v=1792375564', '21335C44-21E7-4E7D-95F1-862AEE4F096D.png?v=1792375565', 'FA068AC0-F80C-46A7-9CD4-009F16F8A7B1.png?v=1792375567', 'A481739B-2F30-4134-AFEA-154DA1D5AF4A.png?v=1792375569', 'EB1C9975-00D0-4BE9-9B43-8271D8A1B003.png?v=1792375571'] },
  { id: 'ttc15', group: 'Tap-to-Connect', name: '1.5-inch Tap to Connect (TTC) Keychains', short: 'NFC smart keychain', special: true,
    desc: 'A compact keychain with an NFC chip inside. One tap on a phone opens your Instagram, website, booking page or menu. No app needed.',
    studio: 'nfc', collection: [],
    tiers: [[1, 15], [5, 14], [10, 12], [25, 10], [50, 9], [100, 8]],
    imgs: ['BDA49754-DA5C-45A8-B9CC-2F4E2B34EFDB-photo-6B70F228-C00E-439E-84D7-62E8A2643A1D.jpg?v=1793672877', 'CF5E47C8-886E-485B-9FF5-3A066A15D571-photo-83B07FF2-C4CB-487F-8D80-5CA63D739993.jpg?v=1793672877', '891C0CFB-E610-4012-A73F-58B92FAC9016-photo-DAC74EBE-0D5B-4953-8A06-1866B84FBBE7.jpg?v=1793672877', '41077034-70AD-4389-BE0D-86405E2E0F25-photo-0299BEF9-1E6A-4DE6-8FD3-42359BA2E305.jpg?v=1793672877', '98A7325E-9772-4FC8-9BEE-9AA65B7F48CF-photo-1013164A-63C5-49C7-ACC9-9F7609E7ABF6.jpg?v=1793672877'] },
  { id: 'ttc225', group: 'Tap-to-Connect', name: '2.25-inch Standard Metal TTC Keychains', short: 'NFC smart keychain', special: true,
    desc: 'Our full-size metal keychain with a programmed NFC chip that links to anywhere you choose.',
    studio: 'nfc', collection: [],
    tiers: [[1, 20], [10, 17], [25, 14], [50, 11], [100, 10]],
    imgs: ['FEBBB21B-96B1-47DD-8853-348AABA6806D.png?v=1792029902', '0C132FE0-9D3C-4541-A8C4-57C042E3D5CC.png?v=1792374853', '9D7F437C-84EA-448A-9B8A-4D91FE492161.png?v=1792374860'] },
  { id: 'ttcmirror', group: 'Tap-to-Connect', name: '2.25-inch Tap-to-Connect Mirror Keychains', short: 'Mirror + NFC', special: true, tag: 'Smart merch',
    desc: 'The mirror keychain, upgraded with NFC. Your design on the front, a mirror on the back and a tap that opens your page.',
    studio: 'nfc', collection: [],
    tiers: [[1, 25], [10, 22], [25, 20], [50, 18], [100, 16], [250, 15]],
    imgs: ['IMG_5610.png?v=1791858710', 'IMG_5611.png?v=1791858711'] },
  { id: 'pocket3', group: 'Pocket mirrors', name: '3-inch Pocket Mirror', short: 'Purse-size mirror', special: true,
    desc: 'A full-size 3-inch pocket mirror with your design on the back. A gift people actually use every day.',
    studio: 'mirror', collection: [],
    tiers: [[1, 10], [10, 9.5], [25, 8], [50, 7], [100, 6.5]],
    imgs: ['3D09DAAD-366D-4391-AF04-2BEE9D7EE5E5.png?v=1792665444', 'DAAB5F99-15A9-4EBE-96E9-9E493F339554.png?v=1792665444', '0A578311-8715-4BB3-98E1-DF65E4D47ABE.png?v=1792665444', '6AABEC39-FF7A-4113-88E5-B305831F4945.png?v=1792665444'] }
];

// live pop-up price lists, built from the pop-up packs in lib/bundles.js (one source for every page)
const livePacks = kind => BUNDLES
  .filter(b => b.items.every(i => i === kind) && b.price)
  .map(b => [`${b.items.length} ${kind}${b.items.length === 1 ? '' : 's'}`, Number(b.price.replace(/[^0-9.]/g, ''))])
  .sort((a, b) => a[1] - b[1]);
export const LIVE = [
  { name: 'NeeksxArt Live Magnets', note: '2.5-inch square photo magnets, made at the event',
    packs: livePacks('magnet'),
    img: 'dji_mimo_20261004_010406_20261004010405_1791101440019_photo.jpg?v=1792033143' },
  { name: 'NeeksxArt Live Personalized Keychains', note: '2.25-inch keychains, one photo per keychain',
    packs: livePacks('keychain'),
    img: '0A4B9D8C-988C-4BC8-842F-40A6DB0969C8.png?v=1792376373' }
];

/* ---------- image paths ---------- */
// Shopify file name (with ?v=...) -> stored name in Supabase (resized to .webp by the upload script)
export const catalogKey = f => f.split('?')[0].replace(/\.[a-z0-9]+$/i, '') + '.webp';
export const SHOPIFY_CDN = 'https://cdn.shopify.com/s/files/1/0858/2486/4477/files/';
const shopify = (f, w) => SHOPIFY_CDN + f + (f.includes('?') ? '&' : '?') + 'width=' + w;
// until Supabase is connected, product photos load from the old Shopify CDN
export const catalogImg = f => (USING_SUPABASE ? media('catalog/' + catalogKey(f)) : shopify(f, 900));
export const catalogThumb = f => (USING_SUPABASE ? media('catalog/thumbs/' + catalogKey(f)) : shopify(f, 200));

// exactly 4 photos per product (photos uploaded from the dashboard replace these — lib/product-photos.js)
export const pics = p => (p.imgs ? p.imgs.map(catalogImg) : p.local.map(media)).slice(0, 4);
export const thumbs = p => (p.imgs ? p.imgs.map(catalogThumb) : p.local.map(media)).slice(0, 4);

/* ---------- pricing ---------- */
export const money = n => '$' + Number(n).toFixed(2);
/** starting price ("From $X") = the 1-piece price of the cheapest product in the list, never the bulk-tier low */
export const startingPrice = ids => money(Math.min(...PRODUCTS.filter(p => ids.includes(p.id)).map(p => p.tiers[0][1])));
export const range = (t, i, all) => {
  const next = all[i + 1];
  return next ? (next[0] - 1 === t[0] ? `${t[0]}` : `${t[0]}–${next[0] - 1}`) : `${t[0]}+`;
};
export const unitFor = (p, q) => {
  let u = p.tiers[0][1];
  p.tiers.forEach(([m, v]) => { if (q >= m) u = v; });
  return u;
};
// never pay more than the next tier's starting order would cost
export const totalFor = (p, q) => {
  let t = q * unitFor(p, q);
  p.tiers.forEach(([m, v]) => { if (m > q) t = Math.min(t, m * v); });
  (p.packs || []).forEach(([m, v]) => { if (m >= q) t = Math.min(t, v); });
  return Math.round(t * 100) / 100;
};
export const mailto = (p, q) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent('Custom order inquiry: ' + p.name)}&body=${encodeURIComponent(
    `Hi NeeksxArt! I'm interested in ${q ? q + ' x ' : ''}${p.name}.\n\nMy idea / design:\n\nNeed it by:\n`
  )}`;

export function productsFor(filter) {
  if (filter === 'magnets') return PRODUCTS.filter(p => p.collection.includes('magnets'));
  if (filter === 'standard') return PRODUCTS.filter(p => !p.special);
  if (filter === 'special') return PRODUCTS.filter(p => p.special);
  return PRODUCTS;
}
