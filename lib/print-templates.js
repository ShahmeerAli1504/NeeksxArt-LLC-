// Print templates offered for download in the dashboard (/admin/templates).
// The sheets ARE the client's own press templates (Template/*Latest*.png, Template/1*inch template2.pdf) with blank photo windows,
// rebuilt with: python3 scripts/build-print-templates.py
// Every sheet is US Letter (8.5 × 11 in). Print at 100% / Actual size, the same way as the original template.

export const PRINT_TEMPLATES = [
  {
    id: 'keychain',
    name: '2.25" Round Keychain / Button',
    sheet: 'Your MPRO Round 2.25" sheet · 12 per sheet · Letter',
    preview: 'preview-keychain-2.25in-round-12up-letter.png',
    specs: [
      ['Cut circle', '2.625" (outer edge of the black rim)'],
      ['Photo window', '2.251" inside the NeeksxArt rim'],
      ['Safe area', '1.875" for text & logos'],
      ['Template', '2.25in Keychains Latest.png, unchanged']
    ],
    files: [
      { file: 'keychain-2.25in-round-12up-letter.pdf', label: 'Sheet PDF', note: 'exactly 8.5 × 11 in' },
      { file: 'keychain-2.25in-round-12up-letter.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'keychain-2.25in-artboard-2.625in.png', label: 'Single artboard', note: '2.625" rim, clear centre · 600 DPI' }
    ]
  },
  {
    id: 'keychain15',
    name: '1.5" Round Keychain',
    sheet: 'Your MPRO Round 1.5" sheet · 15 per sheet · Letter · Punch',
    preview: 'preview-keychain-1.5in-round-15up-letter.png',
    specs: [
      ['Cut circle', '1.84" (outer edge of the black rim)'],
      ['Photo window', '1.54" inside the NeeksxArt rim'],
      ['Safe area', '1.28" for text & logos'],
      ['Template', '1.5 - inch template2.pdf, unchanged']
    ],
    files: [
      { file: 'keychain-1.5in-round-15up-letter.pdf', label: 'Sheet PDF', note: 'exactly 8.5 × 11 in' },
      { file: 'keychain-1.5in-round-15up-letter.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'keychain-ring-1.5in.png', label: 'Single artboard', note: '1.84" rim, clear centre · 300 DPI' }
    ]
  },
  {
    id: 'button1',
    name: '1" Round Button',
    sheet: 'Your MPRO Round 1" sheet · 35 per sheet · Letter · Die cut',
    preview: 'preview-button-1in-round-35up-letter.png',
    specs: [
      ['Cut circle', '1.32" (outer edge of the black rim)'],
      ['Photo window', '1.02" inside the NeeksxArt rim'],
      ['Safe area', '0.85" for text & logos'],
      ['Template', '1 - inch template2.pdf, unchanged']
    ],
    files: [
      { file: 'button-1in-round-35up-letter.pdf', label: 'Sheet PDF', note: 'exactly 8.5 × 11 in' },
      { file: 'button-1in-round-35up-letter.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'button-ring-1in.png', label: 'Single artboard', note: '1.32" rim, clear centre · 300 DPI' }
    ]
  },
  {
    id: 'magnet',
    name: '2.5" Square Magnet',
    sheet: 'Your magnet sheet · 6 per sheet · NeeksxArt flap text',
    preview: 'preview-magnet-2.5in-square-6up-letter.png',
    specs: [
      ['Cut octagon', '3.345" across'],
      ['Photo square', '2.55" (each placed exactly as on your sheet)'],
      ['Safe area', '2.25" for text & logos'],
      ['Template', '2.5_ S MAGS latest.png, unchanged']
    ],
    files: [
      { file: 'magnet-2.5in-square-6up-letter.pdf', label: 'Sheet PDF', note: 'exactly 8.5 × 11 in' },
      { file: 'magnet-2.5in-square-6up-letter.png', label: 'Sheet PNG', note: 'original resolution' },
      { file: 'magnet-2.5in-artboard-2.54in.png', label: 'Single artboard', note: '2.54" · 300 DPI' }
    ]
  },
  {
    id: 'magnet-blank',
    name: '2.5" Square Magnet — blank flaps',
    sheet: 'Your magnet sheet without the flap text · 6 per sheet',
    preview: 'preview-magnet-2.5in-square-6up-letter-blank.png',
    specs: [
      ['Cut octagon', '3.345" across'],
      ['Photo square', '2.55"'],
      ['Flaps', 'blank — add your own text']
    ],
    files: [
      { file: 'magnet-2.5in-square-6up-letter-blank.pdf', label: 'Sheet PDF', note: 'exactly 8.5 × 11 in' },
      { file: 'magnet-2.5in-square-6up-letter-blank.png', label: 'Sheet PNG', note: 'original resolution' }
    ]
  }
];

// every file the download route is allowed to serve
export const TEMPLATE_FILES = new Set([
  ...PRINT_TEMPLATES.flatMap(t => [t.preview, ...t.files.map(f => f.file)]),
  'keychain-ring-2.625in.png'             // rim preview for the sheet maker tiles
]);
