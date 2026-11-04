/* =========================================================
   NeeksxArt pop-up bundle packs
   Edit this list to change what customers can order at events.
   - count:  how many photos/pieces in the pack
   - items:  product for each slot ("magnet" | "keychain" | "mirror" | "button")
   - shape:  "square" or "round" magnets
   - price:  e.g. "$25" — leave null to show "Pay at the booth"
   ========================================================= */
window.NX_BUNDLES = [
  { id: 'nine', name: 'The Nine Pack', blurb: 'Nine photo magnets. Your camera roll, on the fridge.', shape: 'square', cols: 3,
    items: Array(9).fill('magnet'), tag: 'Most popular', price: null },
  { id: 'six', name: 'The Six Pack', blurb: 'Six photo magnets for your favorite memories.', shape: 'square', cols: 3,
    items: Array(6).fill('magnet'), price: null },
  { id: 'trio', name: 'The Trio', blurb: 'Three round glossy photo magnets.', shape: 'round', cols: 3,
    items: Array(3).fill('magnet'), price: null },
  { id: 'mix', name: 'The Mix Pack', blurb: 'Two magnets, a keychain and a mirror keychain.', shape: 'round', cols: 2,
    items: ['magnet', 'magnet', 'keychain', 'mirror'], tag: 'Best gift', price: null }
];
window.NX_POPUP = {
  readyMinutes: [10, 15],      // shown to customers as "ready in 10–15 min"
  orderPrefix: 'NX'
};
