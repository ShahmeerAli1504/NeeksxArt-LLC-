/* =========================================================
   NeeksxArt pop-up bundle packs — the ONE list of live packs.
   The events page, the live order page, the booth poster and the
   pricing page's "Live" price lists all read from here.
   Edit this list to change what customers can order at events.
   - items:  product for each slot ("magnet" | "keychain" | "mirror" | "button")
   - shape:  "square" or "round" magnets
   - price:  e.g. "$25" (null shows "Pay at the booth")
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
    items: Array(9).fill('keychain'), price: '$49.99' },
  { id: 'keys6', name: 'Keychain Six Pack', blurb: 'Six 2.25-inch personalized keychains, one photo each.', shape: 'round', cols: 3,
    items: Array(6).fill('keychain'), price: '$32.99' },
  { id: 'keys3', name: 'Keychain Trio', blurb: 'Three 2.25-inch personalized photo keychains.', shape: 'round', cols: 3,
    items: Array(3).fill('keychain'), price: '$17.99' },
  { id: 'keys1', name: 'Single Keychain', blurb: 'One personalized photo keychain, made while you wait.', shape: 'round', cols: 1,
    items: ['keychain'], price: '$6.99' }
];

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
