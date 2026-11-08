'use client';
// Dashboard → Templates → Sheet maker.
// Drop a whole batch of photos (or logos) at once; they fill the press template in order,
// spilling onto as many sheets as needed. Drag a tile to reposition, use the slider to zoom,
// then download one exact-size PDF. Everything happens in the browser: nothing is uploaded.
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderPrintPdf, jpegInfo, SHEETS, photoWindowInches } from '@/lib/print-sheet-core';

const RING_URL = '/api/admin/templates/keychain-ring-2.625in.png?inline=1';
const TEMPLATES = {
  round: { label: '2.25" Keychain / Button', kind: 'round', flaps: true },
  magnet: { label: '2.5" Magnet', kind: 'magnet', flaps: true },
  magnetBlank: { label: '2.5" Magnet — blank flaps', kind: 'magnet', flaps: false }
};
const PRINT_PPI = 450;          // crop resolution sent to the PDF (prints sharp at 300)
const THUMB = 480;              // preview size kept in memory per photo
let uid = 0;

/* ---------- image helpers ---------- */
async function decode(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image(); img.decoding = 'async'; img.src = url; await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
}
const dims = im => ({ w: im.width || im.naturalWidth, h: im.height || im.naturalHeight });
const release = im => { if (im && typeof im.close === 'function') im.close(); };

/** draw `im` into a size×size square, cover-cropped with the item's zoom/offset (same math as the guest editor) */
function drawCover(ctx, im, item, size, x0 = 0, y0 = 0) {
  const { w: iw, h: ih } = dims(im);
  const k = size / Math.min(iw, ih) * item.zoom, w = iw * k, h = ih * k;
  const mx = Math.max(0, (w - size) / 2 / size), my = Math.max(0, (h - size) / 2 / size);
  item.ox = Math.max(-mx, Math.min(mx, item.ox)); item.oy = Math.max(-my, Math.min(my, item.oy));
  ctx.drawImage(im, x0 + (size - w) / 2 + item.ox * size, y0 + (size - h) / 2 + item.oy * size, w, h);
}
function drawContain(ctx, im, size, x0 = 0, y0 = 0) {
  const { w: iw, h: ih } = dims(im), k = size / Math.max(iw, ih), w = iw * k, h = ih * k;
  ctx.drawImage(im, x0 + (size - w) / 2, y0 + (size - h) / 2, w, h);
}
const canvasJpeg = (c, q) => new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error('encode failed')), 'image/jpeg', q));
async function toPdfJpeg(canvas, q) {
  const data = new Uint8Array(await (await canvasJpeg(canvas, q)).arrayBuffer());
  const j = jpegInfo(data);
  return { kind: 'jpeg', data, w: j.w, h: j.h, comps: j.comps };
}
async function deflate(u8) {
  const s = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function loadRingRaw(img) {
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data, n = c.width * c.height;
  const rgb = new Uint8Array(n * 3), alpha = new Uint8Array(n);
  for (let i = 0; i < n; i++) { rgb[i * 3] = d[i * 4]; rgb[i * 3 + 1] = d[i * 4 + 1]; rgb[i * 3 + 2] = d[i * 4 + 2]; alpha[i] = d[i * 4 + 3]; }
  return { kind: 'raw', w: c.width, h: c.height, rgb, alpha };
}

/* ---------- one preview tile ---------- */
function Tile({ item, index, tpl, fit, ring, onChange, onRemove, onMove, total }) {
  const ref = useRef(null), drag = useRef(null);
  const round = tpl.kind === 'round';
  const inner = round ? photoWindowInches('round') / (SHEETS.round.cut / 72) : 1; // photo window as share of the tile

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const S = c.width, x = c.getContext('2d');
    x.clearRect(0, 0, S, S);
    x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
    const win = S * inner, o = (S - win) / 2;
    x.save();
    if (round) { x.beginPath(); x.arc(S / 2, S / 2, win / 2, 0, Math.PI * 2); x.clip(); }
    if (fit === 'photo') drawCover(x, item.thumb, item, win, o, o);
    else {
      const safe = round ? SHEETS.round.safe / SHEETS.round.cut * S : SHEETS.magnet.safe / SHEETS.magnet.art * S;
      if (round) { const { w, h } = dims(item.thumb), a = w / h, bw = safe * a / Math.hypot(a, 1), bh = safe / Math.hypot(a, 1), k = Math.min(bw / w, bh / h); x.drawImage(item.thumb, (S - w * k) / 2, (S - h * k) / 2, w * k, h * k); }
      else drawContain(x, item.thumb, safe, (S - safe) / 2, (S - safe) / 2);
    }
    x.restore();
    if (round && ring) x.drawImage(ring, 0, 0, S, S);
    if (!round) { x.strokeStyle = 'rgba(0,0,0,.35)'; x.setLineDash([6, 5]); const f = SHEETS.magnet.face / SHEETS.magnet.art * S; x.strokeRect((S - f) / 2, (S - f) / 2, f, f); }
  });

  const down = e => {
    if (fit !== 'photo') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: item.ox, oy: item.oy };
  };
  const move = e => {
    if (!drag.current) return;
    const r = e.currentTarget.getBoundingClientRect(), win = r.width * inner;
    onChange({ ox: drag.current.ox + (e.clientX - drag.current.x) / win, oy: drag.current.oy + (e.clientY - drag.current.y) / win });
  };
  const up = () => { drag.current = null; };

  return (
    <div className="sm-tile">
      <canvas ref={ref} width={320} height={320} className={round ? 'round' : ''}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        title={fit === 'photo' ? 'Drag to move the photo' : ''} />
      <div className="sm-tile-bar">
        <b>#{index + 1}</b>
        <span className="sm-tile-name" title={item.name}>{item.name}</span>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move earlier">←</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move later">→</button>
        <button type="button" onClick={onRemove} aria-label="Remove">✕</button>
      </div>
      {fit === 'photo' && (
        <input type="range" min="100" max="300" value={Math.round(item.zoom * 100)} aria-label="Zoom"
          onChange={e => onChange({ zoom: e.target.value / 100 })} />
      )}
    </div>
  );
}

/* ---------- main ---------- */
export default function SheetMaker() {
  const [tplKey, setTplKey] = useState('round');
  const [fit, setFit] = useState('photo');
  const [items, setItems] = useState([]);
  const [copies, setCopies] = useState(1);
  const [fillSheet, setFillSheet] = useState(false);
  const [numbers, setNumbers] = useState(true);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [over, setOver] = useState(false);
  const [ringImg, setRingImg] = useState(null);
  const inputRef = useRef(null);
  const tpl = TEMPLATES[tplKey], per = SHEETS[tpl.kind].perSheet;

  useEffect(() => {
    const img = new Image(); img.src = RING_URL;
    img.decode().then(() => setRingImg(img)).catch(() => setRingImg(null));
  }, []);

  // the final run of pieces: each photo × copies, optionally repeated to fill the last sheet
  const run = useMemo(() => {
    const out = [];
    items.forEach((it, i) => { for (let c = 0; c < copies; c++) out.push({ it, n: i + 1 }); });
    if (fillSheet && out.length % per) { const base = out.slice(); let j = 0; while (out.length % per) out.push(base[j++ % base.length]); }
    return out;
  }, [items, copies, fillSheet, per]);
  const sheets = Math.ceil(run.length / per);

  async function addFiles(fileList) {
    const files = [...fileList].filter(f => /^image\//.test(f.type) || /\.(heic|heif|jpe?g|png|webp|gif|svg)$/i.test(f.name));
    if (!files.length) return;
    setBusy(`Loading ${files.length} image${files.length > 1 ? 's' : ''}…`); setNote('');
    const added = [], failed = [];
    for (const [i, file] of files.entries()) {
      setBusy(`Loading ${i + 1} of ${files.length}…`);
      let im;
      try {
        im = await decode(file);
        const { w, h } = dims(im), k = Math.min(1, THUMB / Math.min(w, h));
        const t = document.createElement('canvas'); t.width = Math.round(w * k); t.height = Math.round(h * k);
        t.getContext('2d').drawImage(im, 0, 0, t.width, t.height);
        added.push({ id: ++uid, file, name: file.name, thumb: t, zoom: 1, ox: 0, oy: 0 });
      } catch { failed.push(file.name); }
      finally { release(im); }
    }
    setItems(prev => [...prev, ...added]);
    setBusy('');
    if (failed.length) setNote(`Couldn't open: ${failed.join(', ')}. Save those as JPG or PNG and add them again.`);
  }

  const update = (id, patch) => setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  const move = (i, d) => setItems(prev => { const a = prev.slice(); const [x] = a.splice(i, 1); a.splice(i + d, 0, x); return a; });

  async function download() {
    if (!run.length) return;
    setBusy('Building sheets…'); setNote('');
    try {
      const kind = tpl.kind, round = kind === 'round';
      const ring = round && ringImg ? await loadRingRaw(ringImg) : null;
      const winIn = photoWindowInches(kind, !!ring), px = Math.round(winIn * PRINT_PPI);
      const prepared = new Map();
      for (const [i, it] of items.entries()) {
        setBusy(`Preparing image ${i + 1} of ${items.length}…`);
        const im = await decode(it.file);
        try {
          const c = document.createElement('canvas');
          if (fit === 'photo') {
            c.width = c.height = px;
            drawCover(c.getContext('2d'), im, { ...it }, px);
            prepared.set(it.id, await toPdfJpeg(c, 0.92));
          } else {
            const { w, h } = dims(im), k = Math.min(1, 1800 / Math.max(w, h));
            c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
            const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
            prepared.set(it.id, await toPdfJpeg(c, 0.95));
          }
        } finally { release(im); }
      }
      setBusy('Writing PDF…');
      const pieces = run.map(({ it, n }) => ({ img: prepared.get(it.id), key: `p${it.id}`, kind, label: numbers ? `#${n}` : '' }));
      const bytes = await renderPrintPdf({ pieces, fit, title: title.trim(), ring, deflate, flaps: tpl.flaps });
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const a = document.createElement('a');
      const slug = (title.trim() || 'neeksxart').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      a.href = url; a.download = `${slug}-${round ? 'keychains' : 'magnets'}-${sheets}-sheet${sheets > 1 ? 's' : ''}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNote(`Downloaded ${sheets} sheet${sheets > 1 ? 's' : ''} · ${run.length} piece${run.length > 1 ? 's' : ''}. Print at 100% / Actual size.`);
    } catch (e) {
      console.error(e);
      setNote(`Couldn't build the PDF: ${e.message}`);
    } finally { setBusy(''); }
  }

  return (
    <section className="sm">
      <div className="sm-head">
        <div>
          <h2>Sheet maker</h2>
          <p>Select or drop all your photos at once. They fill the template in order and spill onto extra sheets automatically.</p>
        </div>
      </div>

      <div className="sm-controls">
        <div className="adm-tabs">
          {Object.entries(TEMPLATES).map(([k, t]) => (
            <button type="button" key={k} className={k === tplKey ? 'on' : ''} onClick={() => setTplKey(k)}>{t.label}</button>
          ))}
        </div>
        <div className="adm-tabs">
          <button type="button" className={fit === 'photo' ? 'on' : ''} onClick={() => setFit('photo')}>Photos — fill edge to edge</button>
          <button type="button" className={fit === 'logo' ? 'on' : ''} onClick={() => setFit('logo')}>Logos — fit inside safe area</button>
        </div>
        <div className="sm-opts">
          <label>Copies of each <input type="number" min="1" max={per * 4} value={copies} onChange={e => setCopies(Math.max(1, Math.min(per * 4, Number(e.target.value) || 1)))} /></label>
          <label className="sm-check"><input type="checkbox" checked={fillSheet} onChange={e => setFillSheet(e.target.checked)} /> Repeat to fill the last sheet</label>
          <label className="sm-check"><input type="checkbox" checked={numbers} onChange={e => setNumbers(e.target.checked)} /> Number the pieces</label>
          <label className="sm-grow">Name on sheet <input type="text" value={title} placeholder="e.g. Pure Haven order" maxLength={60} onChange={e => setTitle(e.target.value)} /></label>
        </div>
      </div>

      <div className={`sm-drop ${over ? 'over' : ''}`}
        onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()} role="button" tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple hidden
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
        <b>Drop photos here or click to choose</b>
        <span>Select as many as you like at once (Ctrl/Cmd + A in the picker selects a whole folder)</span>
      </div>

      {items.length > 0 && (
        <div className="sm-summary">
          <span><b>{items.length}</b> image{items.length > 1 ? 's' : ''} → <b>{run.length}</b> piece{run.length > 1 ? 's' : ''} → <b>{sheets}</b> sheet{sheets > 1 ? 's' : ''}
            {run.length % per ? ` (${per - (run.length % per)} empty spot${per - (run.length % per) > 1 ? 's' : ''} on the last sheet)` : ''}</span>
          <div className="sm-summary-btns">
            <button type="button" className="adm-link" onClick={() => setItems([])}>Clear all</button>
            <button type="button" className="btn btn-orange" onClick={download} disabled={!!busy}>Download PDF</button>
          </div>
        </div>
      )}
      {(busy || note) && <p className="sm-note">{busy || note}</p>}

      {items.length > 0 && (
        <div className="sm-grid">
          {items.map((it, i) => (
            <Tile key={it.id} item={it} index={i} total={items.length} tpl={tpl} fit={fit} ring={ringImg}
              onChange={p => update(it.id, p)} onRemove={() => setItems(prev => prev.filter(x => x.id !== it.id))}
              onMove={d => move(i, d)} />
          ))}
        </div>
      )}
    </section>
  );
}
