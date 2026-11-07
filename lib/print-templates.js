// Print templates offered for download in the dashboard (/admin/templates).
// Files live in /print-templates and are rebuilt with: python3 scripts/build-print-templates.py
// All sheets are US Letter (8.5 x 11 in). PNGs are 300 DPI (2550 x 3300 px) with the DPI tag set,
// so Canva / Photoshop / the printer all read them at the true size.

export const PRINT_TEMPLATES = [
  {
    id: 'keychain',
    name: '2.25" Round Keychain / Button',
    sheet: '12 per sheet · Letter 8.5 × 11 in',
    preview: 'preview-keychain-2.25in-round-12up-letter.png',
    specs: [
      ['Cut circle', '2.625" (solid black)'],
      ['Finished face', '2.25" (grey dashed)'],
      ['Safe area', '1.875" (blue dotted)'],
      ['Layout', '3 × 4 grid, 2.771" × 2.75" cells']
    ],
    files: [
      { file: 'keychain-2.25in-round-12up-letter.pdf', label: 'Sheet PDF', note: 'vector, exact size' },
      { file: 'keychain-2.25in-round-12up-letter.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'keychain-2.25in-round-12up-letter.svg', label: 'Sheet SVG', note: 'editable' },
      { file: 'keychain-2.25in-artboard-2.625in.png', label: 'Single artboard', note: '2.625" · 600 DPI · 1575 px' }
    ]
  },
  {
    id: 'magnet',
    name: '2.5" Square Magnet',
    sheet: '6 per sheet · Letter 8.5 × 11 in · NeeksxArt flap text',
    preview: 'preview-magnet-2.5in-square-6up-letter.png',
    specs: [
      ['Cut octagon', '3.333" across (solid black)'],
      ['Artwork square', '2.54" (light grey)'],
      ['Finished face', '2.5" (grey dashed)'],
      ['Safe area', '2.25" (blue dotted)']
    ],
    files: [
      { file: 'magnet-2.5in-square-6up-letter.pdf', label: 'Sheet PDF', note: 'vector, exact size' },
      { file: 'magnet-2.5in-square-6up-letter.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'magnet-2.5in-square-6up-letter.svg', label: 'Sheet SVG', note: 'editable' },
      { file: 'magnet-2.5in-artboard-2.54in.png', label: 'Single artboard', note: '2.54" · 300 DPI · 762 px' }
    ]
  },
  {
    id: 'magnet-blank',
    name: '2.5" Square Magnet — blank flaps',
    sheet: '6 per sheet · Letter 8.5 × 11 in · no flap text',
    preview: 'preview-magnet-2.5in-square-6up-letter-blank.png',
    specs: [
      ['Cut octagon', '3.333" across (solid black)'],
      ['Artwork square', '2.54" (light grey)'],
      ['Finished face', '2.5" (grey dashed)'],
      ['Safe area', '2.25" (blue dotted)']
    ],
    files: [
      { file: 'magnet-2.5in-square-6up-letter-blank.pdf', label: 'Sheet PDF', note: 'vector, exact size' },
      { file: 'magnet-2.5in-square-6up-letter-blank.png', label: 'Sheet PNG', note: '300 DPI · 2550 × 3300' },
      { file: 'magnet-2.5in-square-6up-letter-blank.svg', label: 'Sheet SVG', note: 'editable' }
    ]
  }
];

// every file the download route is allowed to serve
export const TEMPLATE_FILES = new Set(
  PRINT_TEMPLATES.flatMap(t => [t.preview, ...t.files.map(f => f.file)])
);
