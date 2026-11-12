/* =========================================================
   NeeksxArt pop-up bundle packs — the ONE list of live packs.
   The events page, the live order page, the booth poster and the
   pricing page's "Live" price lists all read from here.
   Edit this list to change what customers can order at events.
   - items:  product for each slot ("magnet" | "keychain" | "keychain15" | "mirror" | "button")
             keychain = 2.25-inch, keychain15 = 1.5-inch
   - shape:  "square" or "round" magnets
   - price:  before sales tax, e.g. "$25" (null shows "Pay at the booth"); tax is added
             from the location picked when Live ordering is switched on (lib/popup-tax.js)
   ========================================================= */
export const BUNDLES = [
  { id: 'nine', name: 'The Nine Pack', blurb: 'Nine 2.5-inch photo magnets. Your camera roll, on the fridge.', shape: 'square', cols: 3,
    items: Array(9).fill('magnet'), tag: 'Best value', price: '$53.99' },
  { id: 'six', name: 'The Six Pack', blurb: 'Six photo magnets for your favorite memories.', shape: 'square', cols: 3,
    items: Array(6).fill('magnet'), tag: 'Most popular', price: '$37.99' },
  { id: 'trio', name: 'The Trio', blurb: 'Three 2.5-inch square photo magnets.', shape: 'square', cols: 3,
    items: Array(3).fill('magnet'), price: '$19.99' },
  { id: 'single', name: 'The Single', blurb: 'One photo magnet, made while you wait.', shape: 'square', cols: 1,
    items: ['magnet'], price: '$7.99' },
  { id: 'keys9', name: 'Keychain Nine Pack', blurb: 'Nine 2.25-inch personalized keychains, one photo each.', shape: 'round', cols: 3,
    items: Array(9).fill('keychain'), price: '$53.99' },
  { id: 'keys6', name: 'Keychain Six Pack', blurb: 'Six 2.25-inch personalized keychains, one photo each.', shape: 'round', cols: 3,
    items: Array(6).fill('keychain'), tag: 'Most popular', price: '$37.99' },
  { id: 'keys3', name: 'Keychain Trio', blurb: 'Three 2.25-inch personalized photo keychains.', shape: 'round', cols: 3,
    items: Array(3).fill('keychain'), price: '$19.99' },
  { id: 'keys1', name: 'Single Keychain', blurb: 'One personalized photo keychain, made while you wait.', shape: 'round', cols: 1,
    items: ['keychain'], price: '$7.99' },
  // 1.5-inch keychains ("keychain15"): no press template yet, so they're left off the auto print sheet
  { id: 'mini9', name: '1.5" Keychain Nine Pack', blurb: 'Nine 1.5-inch mini photo keychains, one photo each.', shape: 'round', cols: 3,
    items: Array(9).fill('keychain15'), price: '$44.99' },
  { id: 'mini6', name: '1.5" Keychain Six Pack', blurb: 'Six 1.5-inch mini photo keychains, one photo each.', shape: 'round', cols: 3,
    items: Array(6).fill('keychain15'), price: '$31.99' },
  { id: 'mini3', name: '1.5" Keychain Trio', blurb: 'Three 1.5-inch mini photo keychains.', shape: 'round', cols: 3,
    items: Array(3).fill('keychain15'), price: '$16.99' },
  { id: 'mini1', name: 'Single 1.5" Keychain', blurb: 'One 1.5-inch mini photo keychain, made while you wait.', shape: 'round', cols: 1,
    items: ['keychain15'], price: '$5.99' },
  // Tap-to-Connect: live/event-only prices; the guest gives the link we program into every chip in the pack
  { id: 'tap9', name: 'Tap-to-Connect Nine Pack', blurb: 'Nine 2.25-inch tap-to-connect keychains. One tap on a phone opens your link.', shape: 'round', cols: 3,
    items: Array(9).fill('keychain'), tap: true, tag: 'Best value', price: '$197.99' },
  { id: 'tap6', name: 'Tap-to-Connect Six Pack', blurb: 'Six 2.25-inch tap-to-connect keychains with your photos and link.', shape: 'round', cols: 3,
    items: Array(6).fill('keychain'), tap: true, price: '$134.99' },
  { id: 'tap3', name: 'Tap-to-Connect Trio', blurb: 'Three 2.25-inch tap-to-connect keychains with your photos and link.', shape: 'round', cols: 3,
    items: Array(3).fill('keychain'), tap: true, price: '$69.99' },
  { id: 'tap1', name: 'Single Tap-to-Connect', blurb: 'One 2.25-inch tap-to-connect keychain. NFC chip programmed with your link.', shape: 'round', cols: 1,
    items: ['keychain'], tap: true, price: '$24.99' },
  { id: 'tapmini9', name: '1.5" Tap-to-Connect Nine Pack', blurb: 'Nine 1.5-inch tap-to-connect (TTC) keychains. One tap on a phone opens your link.', shape: 'round', cols: 3,
    items: Array(9).fill('keychain15'), tap: true, price: '$152.99' },
  { id: 'tapmini6', name: '1.5" Tap-to-Connect Six Pack', blurb: 'Six 1.5-inch TTC keychains with your photos and link.', shape: 'round', cols: 3,
    items: Array(6).fill('keychain15'), tap: true, price: '$104.99' },
  { id: 'tapmini3', name: '1.5" Tap-to-Connect Trio', blurb: 'Three 1.5-inch TTC keychains with your photos and link.', shape: 'round', cols: 3,
    items: Array(3).fill('keychain15'), tap: true, price: '$54.99' },
  { id: 'tapmini1', name: 'Single 1.5" Tap-to-Connect', blurb: 'One 1.5-inch TTC keychain. NFC chip programmed with your link.', shape: 'round', cols: 1,
    items: ['keychain15'], tap: true, price: '$19.99' }
];

/** Tap link for the NFC chip: adds https:// when missing, only http(s), returns '' if it isn't a usable URL */
export function cleanTapUrl(v) {
  let s = String(v ?? '').trim().slice(0, 300);
  if (!s) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? u.href : '';
  } catch { return ''; }
}

export const POPUP = {
  readyMinutes: [10, 15], // shown to customers as "ready in 10–15 min"
  orderPrefix: 'NX'
};

export const ORDER_STATUSES = ['new', 'printing', 'ready', 'picked_up', 'cancelled'];
export const STATUS_LABEL = {
  new: 'Received', printing: 'Pressing now', ready: 'Ready for pickup', picked_up: 'Picked up', cancelled: 'Cancelled'
};

/** "1 piece", "3 pieces" */
export const pieceCount = n => `${n} piece${n === 1 ? '' : 's'}`;

export const slugify = s =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'pop-up';
