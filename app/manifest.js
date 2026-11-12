export default function manifest() {
  return {
    name: 'NeeksxArt LLC — Custom Keychains, Magnets, Mirrors & Buttons',
    short_name: 'NeeksxArt',
    description: 'Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch, hand-pressed in Reno, NV.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b0b',
    theme_color: '#0b0b0b',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  };
}
