#!/usr/bin/env python3
"""
Builds the blank NeeksxArt print templates served from the admin portal (/admin/templates).

Every measurement below is in points (72 pt = 1 inch) on a US Letter page (612 x 792 pt = 8.5 x 11 in).
Geometry is taken from the press templates in /Template (MPRO round 2.25" + 2.5" square magnet),
cleaned up so every piece is the exact same size and evenly placed.

Outputs (print-templates/):
  *.svg  editable source          *.pdf  vector, exact 8.5 x 11 in
  *.png  300 DPI (2550 x 3300 px, DPI tag set)    preview-*.png  small thumbnails for the dashboard

The 1.5" (15-up) and 1" (35-up) MPRO sheets come in as vector PDFs and are read with PyMuPDF.

Needs: Pillow, numpy, reportlab, pymupdf (+ rsvg-convert for the 2.25"/2.5" single artboards).
Run:  python3 scripts/build-print-templates.py
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


RING_SRC = os.path.join(ROOT, 'Template', '2.25in Keychains Latest.png')  # NeeksxArt keychain design (MPRO round 2.25", 300 DPI)
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


# Flap text — matches Template/2.5_ S MAGS latest.png: Helvetica/Arial Bold 8 pt, hugging the art square.
FLAP_FONT = "'Liberation Sans', Arial, Helvetica, sans-serif"   # Liberation Sans = Arial/Helvetica metrics
FLAP_FS = 8.0
FLAP_ASC, FLAP_DESC = 0.718 * FLAP_FS, 0.207 * FLAP_FS
FLAP_TOP_GAP = 0.017 * IN   # top line: letter tops face the art, this far from its edge
FLAP_RIGHT_EXTRA, FLAP_BOTTOM_SHIFT = 0.014 * IN, 0.057 * IN   # as placed on the latest template


def flap_text(cx, cy):
    a = M_ART / 2
    lines = [  # (text, x, y of the baseline centre, rotation) — orientation as on the press sample
        ('Custom Merch by @neeksxart', cx, cy - a - FLAP_TOP_GAP - FLAP_ASC, 180),
        ('neeksxart.com', cx + FLAP_BOTTOM_SHIFT, cy + a + FLAP_DESC, 180),
        ('Instagram: @neeksxart', cx - a - FLAP_DESC, cy, -90),
        ('info@neeksxart.com', cx + a + FLAP_DESC + FLAP_RIGHT_EXTRA, cy, 90),
    ]
    return ''.join(f'<text transform="translate({n(x)} {n(y)}) rotate({r})" text-anchor="middle" font-family="{FLAP_FONT}" '
                   f'font-size="{n(FLAP_FS)}" font-weight="700" fill="#000">{t}</text>' for t, x, y, r in lines)


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
        out.append(flap_text(cx, cy))
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


# =====================================================================================
# FRAMES — the client's own press templates, used as-is.
# Every sheet (blank downloads, pop-up order sheets, Sheet maker) is built on these, so the
# printed sheet is pixel-identical to Template/*Latest*.png (MPRO strip, rims, flap text).
# The PDF engine lays the blank template down first and draws each photo on top, clipped to its
# window — no transparency or masks, so every printer and PDF viewer renders it the same.
# =====================================================================================
KEY = (1, 254, 2)
KEYCHAIN_SRC = os.path.join(ROOT, 'Template', '2.25in Keychains Latest.png')
MAGNET_SRC = os.path.join(ROOT, 'Template', '2.5_ S MAGS latest.png')


def _fit_circle(pts):
    import numpy as np
    x, y = pts[:, 0], pts[:, 1]
    A = np.c_[2 * x, 2 * y, np.ones(len(x))]
    cx, cy, c = np.linalg.lstsq(A, x * x + y * y, rcond=None)[0]
    return cx, cy, (c + cx * cx + cy * cy) ** 0.5


def build_keychain_frame():
    import numpy as np
    src = np.array(Image.open(KEYCHAIN_SRC).convert('RGB'))
    H, W = src.shape[:2]
    L = src.astype(float).mean(2)
    frame = src.copy()
    frame[(frame == KEY).all(2)] = (0, 0, 0)
    yy, xx = np.mgrid[0:H, 0:W] + 0.5
    slots = []
    for cy0 in (412, 1238, 2064, 2890):            # piece centres on the MPRO round 2.25" sheet
        for cx0 in (412.5, 1245, 2077):
            inner, outer = [], []
            rs = np.arange(300, 410, 0.25)
            for ang in np.linspace(0, 2 * np.pi, 180, endpoint=False):
                dx, dy = np.cos(ang), np.sin(ang)
                xi = np.clip(np.round(cx0 + rs * dx).astype(int), 0, W - 1)
                yi = np.clip(np.round(cy0 + rs * dy).astype(int), 0, H - 1)
                dark = L[yi, xi] < 60
                i = np.argmax(dark); j = len(dark) - 1 - np.argmax(dark[::-1])
                inner.append((cx0 + rs[i] * dx, cy0 + rs[i] * dy)); outer.append((cx0 + rs[j] * dx, cy0 + rs[j] * dy))
            wx, wy, wr = _fit_circle(np.array(inner))
            ox, oy, orr = _fit_circle(np.array(outer))
            r = np.hypot(xx - wx, yy - wy)
            frame[r < wr] = KEY                                     # photo window → see-through
            frame[(r >= wr) & (r < wr + 2.5)] = (0, 0, 0)            # clean black inner edge of the rim
            slots.append({'cx': wx, 'cy': wy, 'r': wr, 'cutCx': ox, 'cutCy': oy, 'cutR': orr})
    blank = frame.copy(); blank[(blank == KEY).all(2)] = (255, 255, 255)
    return W, H, slots, blank


def build_magnet_frames():
    import numpy as np
    src = np.array(Image.open(MAGNET_SRC).convert('RGB'))
    H, W = src.shape[:2]
    A = src.astype(int); L = A.mean(2); S = A.max(2) - A.min(2)
    frame = src.copy()
    frame[(frame == KEY).all(2)] = (0, 0, 0)
    dpi = W / 8.5
    slots = []
    for (y0, y1) in ((0, 660), (660, 1330), (1330, 2000)):
        for (x0, x1) in ((0, 772), (772, W)):
            ys, xs = np.where(S[y0:y1, x0:x1] > 8)                    # the placeholder photo square
            sx0, sy0, sx1, sy1 = x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1
            ys2, xs2 = np.where((L[y0:y1, x0:x1] < 120) & (S[y0:y1, x0:x1] < 40))   # octagon line + text
            ox0, oy0, ox1, oy1 = x0 + xs2.min(), y0 + ys2.min(), x0 + xs2.max() + 1, y0 + ys2.max() + 1
            frame[sy0:sy1, sx0:sx1] = KEY
            slots.append({'x': sx0, 'y': sy0, 'w': sx1 - sx0, 'h': sy1 - sy0, 'ox': ox0, 'oy': oy0, 'ow': ox1 - ox0, 'oh': oy1 - oy0})
    # same frame without the flap text (text sits in the four bands between photo and octagon)
    blank_flaps = frame.copy()
    for s in slots:
        cx, cy = s['x'] + s['w'] / 2, s['y'] + s['h'] / 2
        hx, hy = int(0.86 * dpi), int(0.70 * dpi)
        bands = [(int(cx - hx), s['oy'] + 4, int(cx + hx), s['y']),
                 (int(cx - hx), s['y'] + s['h'], int(cx + hx), s['oy'] + s['oh'] - 4),
                 (s['ox'] + 4, int(cy - hy), s['x'], int(cy + hy)),
                 (s['x'] + s['w'], int(cy - hy), s['ox'] + s['ow'] - 4, int(cy + hy))]
        for bx0, by0, bx1, by1 in bands:
            blank_flaps[by0:by1, bx0:bx1] = (255, 255, 255)
    out = []
    for f in (frame, blank_flaps):
        b = f.copy(); b[(b == KEY).all(2)] = (255, 255, 255); out.append(b)
    return W, H, slots, out[0], out[1]


def save_sheet(name, arr, dpi):
    """blank downloadable sheet: PNG with the right DPI tag + lossless PDF at exactly 8.5 x 11 in"""
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
    im = Image.fromarray(arr)
    png = os.path.join(OUT, name + '.png')
    im.save(png, dpi=(dpi, dpi), optimize=True)
    c = canvas.Canvas(os.path.join(OUT, name + '.pdf'), pagesize=(612, 792), pageCompression=1)
    c.setTitle(name); c.setAuthor('NeeksxArt')
    c.drawImage(ImageReader(png), 0, 0, width=612, height=792)   # the whole template fills the Letter page exactly
    c.showPage(); c.save()
    t = im.copy(); t.thumbnail((935, 1210)); t.save(os.path.join(OUT, 'preview-' + name + '.png'), optimize=True)


# Smaller MPRO round sheets, supplied as vector PDFs (exported by MPRO at 3.125x, i.e. 26.5625 x 34.375 "in").
# (FRAMES key, source PDF, blank sheet name, rim-only PNG for the Sheet maker tiles / single artboard)
PDF_ROUNDS = [
    ('round15', os.path.join(ROOT, 'Template', '1.5 - inch template2.pdf'), 'keychain-1.5in-round-15up-letter', 'keychain-ring-1.5in.png'),
    ('round1', os.path.join(ROOT, 'Template', '1 - inch template2.pdf'), 'button-1in-round-35up-letter', 'button-ring-1in.png'),
]


def build_pdf_round_frame(src, ring_name):
    """Rasterise the MPRO PDF at 300 DPI (2550 x 3300), find every rim + photo window, blank the placeholder photos.
    Also returns the '####' order-number spots and the free stretch of MPRO's right-hand strip (for the order label)."""
    import numpy as np
    import pymupdf
    page = pymupdf.open(src)[0]
    k = 612 / page.rect.width                       # page units → Letter points
    z = 2550 / page.rect.width
    pix = page.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False)
    W, H = pix.width, pix.height
    img = np.frombuffer(pix.samples, np.uint8).reshape(H, pix.stride)[:, :W * 3].reshape(H, W, 3).copy()
    L = img.astype(float).mean(2)
    px = 2550 / 612                                 # points → pixels
    frame = img.copy()
    yy, xx = np.mgrid[0:H, 0:W] + 0.5

    rims = sorted([d['rect'] * k for d in page.get_drawings()
                   if d.get('fill') == (0.0, 0.0, 0.0) and len(d['items']) > 200],   # the black rim rings
                  key=lambda r: (round(r.y0), r.x0))
    slots = []
    for rect in rims:
        cx0, cy0, R = (rect.x0 + rect.x1) / 2 * px, (rect.y0 + rect.y1) / 2 * px, rect.width / 2 * px
        inner, outer = [], []
        rs = np.arange(0.3 * R, 1.08 * R, 0.25)
        for ang in np.linspace(0, 2 * np.pi, 180, endpoint=False):
            dx, dy = np.cos(ang), np.sin(ang)
            xi = np.clip(np.round(cx0 + rs * dx).astype(int), 0, W - 1)
            yi = np.clip(np.round(cy0 + rs * dy).astype(int), 0, H - 1)
            dark = L[yi, xi] < 60
            i = np.argmax(dark); j = len(dark) - 1 - np.argmax(dark[::-1])
            inner.append((cx0 + rs[i] * dx, cy0 + rs[i] * dy)); outer.append((cx0 + rs[j] * dx, cy0 + rs[j] * dy))
        wx, wy, wr = _fit_circle(np.array(inner))
        ox, oy, orr = _fit_circle(np.array(outer))
        slots.append({'cx': wx, 'cy': wy, 'r': wr, 'cutR': orr})
    # one window size for the whole sheet (the placeholder photo overlaps the rim by a hair on some pieces)
    wr = float(np.median([s['r'] for s in slots]))
    for s in slots:
        s['r'] = wr
        r = np.hypot(xx - s['cx'], yy - s['cy'])
        frame[r < wr] = (255, 255, 255)                          # placeholder photo → blank window
        frame[(r >= wr) & (r < wr + 2.5)] = (0, 0, 0)            # clean black inner edge of the rim

    words = page.get_text('words')
    spots = [pymupdf.Rect(w[:4]) * k for w in words if w[4] == '####']
    # MPRO strip: right of the vertical line near the page edge; find its longest stretch with no text or logo
    strip_x = max(d['rect'].x0 * k for d in page.get_drawings() if d.get('color') and d['rect'].width * k < 1 and d['rect'].height * k > 700)
    busy = [(w[1] * k, w[3] * k) for w in words if (w[0] + w[2]) / 2 * k > strip_x]
    busy += [(b[1], b[3]) for b in ((pymupdf.Rect(i['bbox']) * k) for i in page.get_image_info()) if (b.x0 + b.x1) / 2 > strip_x]
    busy.sort()
    gaps, y = [], 0.0
    for a, b in busy:
        if a > y: gaps.append((y, a))
        y = max(y, b)
    gaps.append((y, 792.0))
    y0, y1 = max(gaps, key=lambda g: g[1] - g[0])
    strip = {'cx': (strip_x + 612) / 2, 'y0': y0, 'y1': y1}

    # rim-only PNG of the first piece (transparent window + outside), for the Sheet maker tiles / single artboard
    s = slots[0]
    S = int(np.ceil(2 * s['cutR'])) + 2
    x0, y0p = int(round(s['cx'] - S / 2)), int(round(s['cy'] - S / 2))
    crop = frame[y0p:y0p + S, x0:x0 + S].astype(float)
    cy_, cx_ = s['cy'] - y0p, s['cx'] - x0
    ry = np.hypot(np.mgrid[0:S, 0:S][1] + 0.5 - cx_, np.mgrid[0:S, 0:S][0] + 0.5 - cy_)
    a = np.clip(ry - (s['r'] - 0.5), 0, 1) * np.clip((s['cutR'] + 0.5) - ry, 0, 1)
    Image.fromarray(np.dstack([crop, a * 255]).round().astype(np.uint8), 'RGBA').save(os.path.join(OUT, ring_name), dpi=(300, 300), optimize=True)
    return W, H, slots, frame, spots, strip


def build_frames():
    kw, kh, kslots, kblank = build_keychain_frame()
    mw, mh, mslots, mblank, mblank_flaps = build_magnet_frames()
    save_sheet('keychain-2.25in-round-12up-letter', kblank, 300)
    save_sheet('magnet-2.5in-square-6up-letter', mblank, mw / 8.5)
    save_sheet('magnet-2.5in-square-6up-letter-blank', mblank_flaps, mw / 8.5)
    kp, mp, mpy = 612 / kw, 612 / mw, 792 / mh                   # pixels → PDF points (frame stretched to exactly 8.5 x 11)
    r3 = lambda v: round(float(v), 3)
    js = ['// GENERATED by scripts/build-print-templates.py from the press templates in Template/ — do not edit by hand.',
          '// Exact photo windows of the client\'s own press templates, in PDF points (72 = 1 inch) on a Letter page.',
          '// `file` = the blank template sheet (print-templates/) that every printed sheet is built on; `ring` = rim-only PNG.',
          '// `spots` = the "####" order-number boxes on the template; `strip` = free stretch of MPRO\'s right-hand strip.',
          'export const FRAMES = {',
          f"  round: {{ file: 'keychain-2.25in-round-12up-letter.png', ring: 'keychain-ring-2.625in.png', w: {kw}, h: {kh}, slots: ["]
    js += [f"    {{ cx: {r3(s['cx']*kp)}, cy: {r3(s['cy']*kp)}, r: {r3(s['r']*kp)}, cutR: {r3(s['cutR']*kp)} }}," for s in kslots]
    js += ['  ] },']
    for key, src, name, ring in PDF_ROUNDS:
        w, h, slots, arr, spots, strip = build_pdf_round_frame(src, ring)
        save_sheet(name, arr, 300)
        p = 612 / w
        js.append(f"  {key}: {{ file: '{name}.png', ring: '{ring}', w: {w}, h: {h}, "
                  f"strip: {{ cx: {r3(strip['cx'])}, y0: {r3(strip['y0'])}, y1: {r3(strip['y1'])} }}, "
                  f"spots: [{', '.join(f'{{ x: {r3(b.x0)}, y: {r3(b.y0)}, w: {r3(b.width)}, h: {r3(b.height)} }}' for b in spots)}], slots: [")
        js += [f"    {{ cx: {r3(s['cx']*p)}, cy: {r3(s['cy']*p)}, r: {r3(s['r']*p)}, cutR: {r3(s['cutR']*p)} }}," for s in slots]
        js.append('  ] },')
    js += [f"  magnet: {{ file: 'magnet-2.5in-square-6up-letter.png', fileBlank: 'magnet-2.5in-square-6up-letter-blank.png', w: {mw}, h: {mh}, slots: ["]
    js += [f"    {{ x: {r3(s['x']*mp)}, y: {r3(s['y']*mpy)}, w: {r3(s['w']*mp)}, h: {r3(s['h']*mpy)}, ox: {r3(s['ox']*mp)}, oy: {r3(s['oy']*mpy)}, ow: {r3(s['ow']*mp)}, oh: {r3(s['oh']*mpy)} }}," for s in mslots]
    js += ['  ] }', '};', '']
    with open(os.path.join(ROOT, 'lib', 'print-frames.js'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(js))
    return kslots, mslots


def main():
    os.makedirs(OUT, exist_ok=True)
    build_ring()
    build_frames()
    import shutil
    if shutil.which('rsvg-convert'):
        render('keychain-2.25in-artboard-2.625in', keychain_artboard(), dpi=600, pdf=False, flatten=False)
        render('magnet-2.5in-artboard-2.54in', magnet_artboard(), dpi=300, pdf=False, flatten=False)
    else:
        print('rsvg-convert not found: kept the existing single artboards')
    print('templates written to', OUT)


if __name__ == '__main__':
    sys.exit(main())
