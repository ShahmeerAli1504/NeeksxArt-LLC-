#!/usr/bin/env python3
"""
Builds the blank NeeksxArt print templates served from the admin portal (/admin/templates).

Every measurement below is in points (72 pt = 1 inch) on a US Letter page (612 x 792 pt = 8.5 x 11 in).
Geometry is taken from the press templates in /Template (MPRO round 2.25" + 2.5" square magnet),
cleaned up so every piece is the exact same size and evenly placed.

Outputs (print-templates/):
  *.svg  editable source          *.pdf  vector, exact 8.5 x 11 in
  *.png  300 DPI (2550 x 3300 px, DPI tag set)    preview-*.png  small thumbnails for the dashboard

Needs: rsvg-convert (librsvg) and Pillow.  Run:  python3 scripts/build-print-templates.py
"""
import os, re, subprocess, sys
from PIL import Image, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'print-templates')
IN = 72.0
PAGE_W, PAGE_H = 8.5 * IN, 11 * IN

FONT = 'Inter, Helvetica, Arial, sans-serif'
CUT = '#000000'      # cut line (printed, you cut on it)
FACE = '#8a8a8a'     # finished face edge (dashed)
SAFE = '#3fb6e8'     # keep text/logos inside (dotted)
GRID = '#b4b4b4'


def n(v):
    return f'{v:.3f}'.rstrip('0').rstrip('.')


def svg_doc(w_pt, h_pt, body, bg='#ffffff'):
    bg_rect = f'<rect width="{n(w_pt)}" height="{n(h_pt)}" fill="{bg}"/>' if bg else ''
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{n(w_pt)}pt" height="{n(h_pt)}pt" '
            f'viewBox="0 0 {n(w_pt)} {n(h_pt)}">\n{bg_rect}\n{body}\n</svg>\n')


def ruler_1in(x, y, vertical=True):
    """1-inch check bar: measure it after printing to confirm the printer used 100% / Actual size."""
    if vertical:
        return (f'<g stroke="#000" stroke-width="0.6" fill="none">'
                f'<line x1="{n(x)}" y1="{n(y)}" x2="{n(x)}" y2="{n(y + IN)}"/>'
                f'<line x1="{n(x - 3)}" y1="{n(y)}" x2="{n(x + 3)}" y2="{n(y)}"/>'
                f'<line x1="{n(x - 3)}" y1="{n(y + IN)}" x2="{n(x + 3)}" y2="{n(y + IN)}"/></g>')
    return (f'<g stroke="#000" stroke-width="0.6" fill="none">'
            f'<line x1="{n(x)}" y1="{n(y)}" x2="{n(x + IN)}" y2="{n(y)}"/>'
            f'<line x1="{n(x)}" y1="{n(y - 3)}" x2="{n(x)}" y2="{n(y + 3)}"/>'
            f'<line x1="{n(x + IN)}" y1="{n(y - 3)}" x2="{n(x + IN)}" y2="{n(y + 3)}"/></g>')


# ---------------------------------------------------------------- 2.25" round keychain / button, 12-up
K_CUT_D = 2.625 * IN      # die-cut circle (art + wrap/bleed)
K_FACE_D = 2.25 * IN      # finished front of the 2.25" keychain/button
K_SAFE_D = 1.875 * IN     # keep text & logos inside this
K_COLS, K_ROWS = 3, 4
K_GRID_W = 8.3125 * IN    # MPRO grid width; the 0.1875" strip on the right holds the label
K_CELL_W, K_CELL_H = K_GRID_W / K_COLS, PAGE_H / K_ROWS   # 2.7708" x 2.75"


def keychain_centers():
    return [((c + .5) * K_CELL_W, (r + .5) * K_CELL_H) for r in range(K_ROWS) for c in range(K_COLS)]


RING_SRC = os.path.join(ROOT, 'Template', '2.25in keychain update.png')   # NeeksxArt keychain design (MPRO round 2.25", 300 DPI)
RING_PNG = os.path.join(OUT, 'keychain-ring-2.625in.png')                  # black rim + gold lettering, transparent 2.25" window


def build_ring():
    """Cut the branded rim out of the keychain design: everything between the 2.25" face and the 2.625" cut circle."""
    if not os.path.exists(RING_SRC):
        if os.path.exists(RING_PNG):
            return
        sys.exit(f'missing {RING_SRC}')
    import numpy as np
    src = np.array(Image.open(RING_SRC).convert('RGB')).astype(float)
    S, cx, cy = 788, 1245.0, 412.0                # top-middle piece of the 300 DPI sheet
    r_out, r_in = S / 2, 2.25 * 300 / 2
    crop = src[int(cy - S / 2):int(cy - S / 2) + S, int(cx - S / 2):int(cx - S / 2) + S]
    yy, xx = np.mgrid[0:S, 0:S] + 0.5
    r = np.hypot(xx - S / 2, yy - S / 2)
    band = (r > r_in + 3) & (r < r_out - 2.5)
    out = np.zeros_like(crop)
    out[band] = crop[band]
    a = np.clip(r - (r_in - 0.5), 0, 1) * np.clip((r_out + 0.5) - r, 0, 1)
    Image.fromarray(np.dstack([out, a * 255]).round().astype(np.uint8), 'RGBA').save(RING_PNG, dpi=(300, 300), optimize=True)


def ring_href():
    import base64
    with open(RING_PNG, 'rb') as fh:
        return 'data:image/png;base64,' + base64.b64encode(fh.read()).decode()


def piece_keychain(cx, cy, ring=None):
    """Branded rim (2.625" cut, 2.25" photo window) + safe-area guide inside the window."""
    r = K_CUT_D / 2
    rim = (f'<image x="{n(cx - r)}" y="{n(cy - r)}" width="{n(K_CUT_D)}" height="{n(K_CUT_D)}" href="{ring}" xlink:href="{ring}"/>'
           if ring else f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}" fill="none" stroke="{CUT}" stroke-width="0.5"/>')
    return (rim +
            f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(K_SAFE_D / 2)}" fill="none" stroke="{SAFE}" stroke-width="0.5" stroke-dasharray="1 2.5"/>'
            f'<path d="M{n(cx - 4)} {n(cy)}H{n(cx + 4)}M{n(cx)} {n(cy - 4)}V{n(cy + 4)}" stroke="{GRID}" stroke-width="0.4"/>')


def keychain_sheet():
    parts = []
    # grid / cut guides (same as the MPRO sheet)
    g = [f'<line x1="{n(c * K_CELL_W)}" y1="0" x2="{n(c * K_CELL_W)}" y2="{n(PAGE_H)}"/>' for c in range(1, K_COLS + 1)]
    g += [f'<line x1="0" y1="{n(r * K_CELL_H)}" x2="{n(K_GRID_W)}" y2="{n(r * K_CELL_H)}"/>' for r in range(1, K_ROWS)]
    parts.append(f'<g stroke="{GRID}" stroke-width="0.5">{"".join(g)}</g>')
    ring = ring_href()
    parts += [piece_keychain(cx, cy, ring) for cx, cy in keychain_centers()]
    # label strip
    sx = K_GRID_W + (PAGE_W - K_GRID_W) / 2
    label = ('NeeksxArt  ·  Round 2.25" keychain / button  ·  12 per sheet  ·  Cut circle 2.625" (outer edge of rim)  ·  '
             'Photo window 2.25"  ·  Safe 1.875" (dotted)  ·  Letter 8.5 x 11 in  ·  Print at 100% / Actual size')
    parts.append(f'<text transform="translate({n(sx + 2.2)} {n(PAGE_H - 12)}) rotate(-90)" font-family="{FONT}" '
                 f'font-size="5.6" font-weight="600" fill="#333">{label}</text>')
    parts.append(ruler_1in(sx, 12))
    parts.append(f'<text transform="translate({n(sx + 2)} {n(12 + IN + 4)}) rotate(-90)" text-anchor="end" '
                 f'font-family="{FONT}" font-size="5" font-weight="700" fill="#000">1 in</text>')
    return svg_doc(PAGE_W, PAGE_H, '\n'.join(parts))


def keychain_artboard():
    s = K_CUT_D
    c = s / 2
    return svg_doc(s, s, piece_keychain(c, c, ring_href()), bg=None)


# ---------------------------------------------------------------- 2.5" square magnet, 6-up
M_CUT = 10 / 3 * IN          # octagon cut, 3.333" across
M_CHAMFER = 0.7723 * IN      # corner cut on the octagon (measured from the press template)
M_ART = 2.54 * IN            # artwork square (2.5" face + a hair of bleed)
M_FACE = 2.5 * IN            # finished magnet face
M_SAFE = 2.25 * IN           # keep text & logos inside
M_COLS, M_ROWS = 2, 3
M_GAP_X, M_GAP_Y = 0.5 * IN, (PAGE_H - M_ROWS * M_CUT - 2 * (1 / 6 * IN)) / (M_ROWS - 1)
M_MARGIN_X = (PAGE_W - M_COLS * M_CUT - (M_COLS - 1) * M_GAP_X) / 2
M_MARGIN_Y = 1 / 6 * IN
FLAP_FONT_PATH = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'


def magnet_origins():
    return [(M_MARGIN_X + c * (M_CUT + M_GAP_X), M_MARGIN_Y + r * (M_CUT + M_GAP_Y))
            for r in range(M_ROWS) for c in range(M_COLS)]


def fit_font(text, width_pt, start=8.0):
    try:
        f = ImageFont.truetype(FLAP_FONT_PATH, 1000)
    except OSError:
        return start
    w = f.getlength(text) / 1000.0
    return min(start, width_pt / w)


def piece_magnet(x, y, flaps=True):
    s, k = M_CUT, M_CHAMFER
    pts = [(x + k, y), (x + s - k, y), (x + s, y + k), (x + s, y + s - k), (x + s - k, y + s), (x + k, y + s), (x, y + s - k), (x, y + k)]
    oct_d = 'M' + ' L'.join(f'{n(a)} {n(b)}' for a, b in pts) + ' Z'
    cx, cy = x + s / 2, y + s / 2
    out = [f'<path d="{oct_d}" fill="none" stroke="{CUT}" stroke-width="0.75"/>']
    for size, col, dash, w in ((M_ART, '#d4d4d4', None, 0.5), (M_FACE, FACE, '4 3', 0.5), (M_SAFE, SAFE, '1 2.5', 0.5)):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        out.append(f'<rect x="{n(cx - size / 2)}" y="{n(cy - size / 2)}" width="{n(size)}" height="{n(size)}" fill="none" stroke="{col}" stroke-width="{w}"{d}/>')
    out.append(f'<path d="M{n(cx - 4)} {n(cy)}H{n(cx + 4)}M{n(cx)} {n(cy - 4)}V{n(cy + 4)}" stroke="{GRID}" stroke-width="0.4"/>')
    if flaps:
        band = (s - M_ART) / 2                  # flap band between artwork and octagon edge
        off = M_ART / 2 + band * 0.42           # text baseline position from centre
        texts = [  # (text, rotation, dx, dy) — same orientation as the press sample
            ('Custom Merch by @neeksxart', 180, 0, -off),
            ('neeksxart.com', 180, 0, off),
            ('Instagram: @neeksxart', -90, -off, 0),
            ('info@neeksxart.com', 90, off, 0),
        ]
        fs = fit_font('Custom Merch by @neeksxart', 1.55 * IN, 7.5)
        for t, rot, dx, dy in texts:
            out.append(f'<text transform="translate({n(cx + dx)} {n(cy + dy)}) rotate({rot})" text-anchor="middle" '
                       f'dominant-baseline="central" font-family="{FONT}" font-size="{n(fs)}" font-weight="700" fill="#000">{t}</text>')
    return ''.join(out)


def magnet_sheet(flaps=True):
    parts = [piece_magnet(x, y, flaps) for x, y in magnet_origins()]
    label = ('NeeksxArt  ·  2.5" square magnet  ·  6 per sheet  ·  Cut on the octagon (3.333")  ·  Art 2.54" (grey)  ·  '
             'Face 2.5" (dashed)  ·  Safe 2.25" (dotted)  ·  Letter 8.5 x 11 in  ·  Print at 100% / Actual size')
    lx = M_MARGIN_X / 2
    parts.append(f'<text transform="translate({n(lx + 2)} {n(PAGE_H - 0.25 * IN - IN - 8)}) rotate(-90)" font-family="{FONT}" '
                 f'font-size="5.6" font-weight="600" fill="#333">{label}</text>')
    parts.append(ruler_1in(lx, PAGE_H - 0.25 * IN - IN))
    parts.append(f'<text transform="translate({n(lx + 6)} {n(PAGE_H - 0.25 * IN - IN / 2)}) rotate(-90)" text-anchor="middle" '
                 f'font-family="{FONT}" font-size="5" font-weight="700" fill="#000">1 in</text>')
    return svg_doc(PAGE_W, PAGE_H, '\n'.join(parts))


def magnet_artboard():
    s = M_ART
    c = s / 2
    body = (f'<rect x="0.25" y="0.25" width="{n(s - .5)}" height="{n(s - .5)}" fill="none" stroke="#d4d4d4" stroke-width="0.5"/>'
            f'<rect x="{n(c - M_FACE / 2)}" y="{n(c - M_FACE / 2)}" width="{n(M_FACE)}" height="{n(M_FACE)}" fill="none" stroke="{FACE}" stroke-width="0.5" stroke-dasharray="4 3"/>'
            f'<rect x="{n(c - M_SAFE / 2)}" y="{n(c - M_SAFE / 2)}" width="{n(M_SAFE)}" height="{n(M_SAFE)}" fill="none" stroke="{SAFE}" stroke-width="0.5" stroke-dasharray="1 2.5"/>')
    return svg_doc(s, s, body, bg=None)


# ---------------------------------------------------------------- render
def render(name, svg, dpi=300, pdf=True, preview=False, flatten=True):
    svg_path = os.path.join(OUT, name + '.svg')
    with open(svg_path, 'w') as f:
        f.write(svg)
    if pdf:
        subprocess.run(['rsvg-convert', '-f', 'pdf', '-o', os.path.join(OUT, name + '.pdf'), svg_path], check=True)
    png = os.path.join(OUT, name + '.png')
    subprocess.run(['rsvg-convert', '-f', 'png', '--dpi-x', str(dpi), '--dpi-y', str(dpi), '-o', png, svg_path], check=True)
    im = Image.open(png)
    want = (round(float(re.search(r'width="([\d.]+)pt"', svg).group(1)) / 72 * dpi),
            round(float(re.search(r'height="([\d.]+)pt"', svg).group(1)) / 72 * dpi))
    if im.size != want:  # librsvg rounds partial pixels up; trim to the exact size
        im = im.crop((0, 0) + want)
    if flatten:
        bg = Image.new('RGB', im.size, 'white')
        bg.paste(im, mask=im.split()[-1] if im.mode == 'RGBA' else None)
        im = bg
    im.save(png, dpi=(dpi, dpi), optimize=True)
    if preview:
        p = os.path.join(OUT, 'preview-' + name + '.png')
        subprocess.run(['rsvg-convert', '-f', 'png', '--dpi-x', '110', '--dpi-y', '110', '-b', 'white', '-o', p, svg_path], check=True)
    return png


def main():
    os.makedirs(OUT, exist_ok=True)
    build_ring()
    render('keychain-2.25in-round-12up-letter', keychain_sheet(), preview=True)
    render('keychain-2.25in-artboard-2.625in', keychain_artboard(), dpi=600, pdf=False, flatten=False)
    render('magnet-2.5in-square-6up-letter', magnet_sheet(True), preview=True)
    render('magnet-2.5in-square-6up-letter-blank', magnet_sheet(False), preview=True)
    render('magnet-2.5in-artboard-2.54in', magnet_artboard(), dpi=300, pdf=False, flatten=False)
    print('templates written to', OUT)


if __name__ == '__main__':
    sys.exit(main())
