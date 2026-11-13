/* =========================================================
   Customer photos for online orders (shared by the browser + server)
   Every piece in an online order gets a photo the customer uploads and crops at checkout.
   We print exactly what they upload, no proof step.
   - shape: how the photo is cropped in the browser (square magnet or round piece)
   - sheet: the press template the dashboard places photos on (lib/print-sheet-core.js SHEETS);
            null = no template for that size yet (photos are still downloadable one by one)
   ========================================================= */
export const PHOTO_PRODUCTS = {
  mag25:  { shape: 'square', sheet: 'magnet' },
  mag225: { shape: 'round',  sheet: 'round' },
  btn225: { shape: 'round',  sheet: 'round' },
  kc225:  { shape: 'round',  sheet: 'round' },
  kc15:   { shape: 'round',  sheet: 'round15' },
  btn1:   { shape: 'round',  sheet: 'round1' },
  ttc15:  { shape: 'round',  sheet: 'round15' },   // Tap-to-Connect: same press templates as the keychains
  ttc225: { shape: 'round',  sheet: 'round' }
};

export const photoSpec = id => PHOTO_PRODUCTS[id] || null;
export const needsPhotos = id => !!PHOTO_PRODUCTS[id];

/** most different photos one order can upload (a 250-pack can still be one logo × 250) */
export const MAX_PHOTOS = 60;
/** exported crop size in px (2.5" at ~360 dpi; the print sheet scales it into the window) */
export const EXPORT_PX = 900;
