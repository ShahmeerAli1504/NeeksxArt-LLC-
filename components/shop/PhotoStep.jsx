'use client';
// Checkout step: the customer uploads a photo for every piece, crops it to the real shape
// (square magnet or round piece) and says how many pieces each photo goes on.
// We print exactly what they crop here, so there's no proof step.
import { useEffect, useRef, useState } from 'react';
import { photoSpec, EXPORT_PX } from '@/lib/shop-photos';

let nextId = 1;

/* ---------- image helpers ---------- */
function fileToCanvas(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const max = 2000, k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    im.src = url;
  });
}
function clamp(p, w, h, size) {
  const mx = Math.max(0, (w - size) / 2 / size), my = Math.max(0, (h - size) / 2 / size);
  p.ox = Math.max(-mx, Math.min(mx, p.ox)); p.oy = Math.max(-my, Math.min(my, p.oy));
}
/** draw photo p's crop into ctx as a size×size square */
export function drawCrop(ctx, p, size) {
  const iw = p.img.width, ih = p.img.height;
  const k = size / Math.min(iw, ih) * p.zoom;
  const w = iw * k, h = ih * k;
  clamp(p, w, h, size);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.drawImage(p.img, (size - w) / 2 + p.ox * size, (size - h) / 2 + p.oy * size, w, h);
}
/** the print file for one photo: a square JPEG of exactly the crop the customer saw */
export function exportPhoto(p) {
  const c = document.createElement('canvas'); c.width = c.height = EXPORT_PX;
  drawCrop(c.getContext('2d'), p, EXPORT_PX);
  return new Promise(res => c.toBlob(res, 'image/jpeg', 0.9));
}
export const assigned = list => (list || []).reduce((a, p) => a + p.count, 0);

function Thumb({ p, round }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) drawCrop(ref.current.getContext('2d'), p, 240); }, [p, p.zoom, p.ox, p.oy]);
  return <canvas ref={ref} width="240" height="240" className={round ? 'ph-round' : ''} />;
}

function Editor({ p, round, onChange, onClose, onRemove }) {
  const ref = useRef(null), drag = useRef(null);
  const S = 480;
  useEffect(() => {
    const x = ref.current?.getContext('2d'); if (!x) return;
    drawCrop(x, p, S);
    x.save(); x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.rect(0, 0, S, S);
    if (round) x.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2, true); else x.rect(S - 6, 6, -(S - 12), S - 12);
    x.fill('evenodd'); x.restore();
    x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath();
    round ? x.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2) : x.rect(6, 6, S - 12, S - 12); x.stroke();
  }, [p, p.zoom, p.ox, p.oy, round]);

  const down = e => { drag.current = { x: e.clientX, y: e.clientY, ox: p.ox, oy: p.oy }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = e => {
    if (!drag.current) return;
    const r = e.currentTarget.getBoundingClientRect(), d = drag.current;
    onChange({ ox: d.ox + (e.clientX - d.x) / r.width, oy: d.oy + (e.clientY - d.y) / r.height });
  };
  const up = () => { drag.current = null; };

  return (
    <div className="ph-editor" role="dialog" aria-modal="true" aria-label="Adjust photo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ph-editor-card">
        <b>Drag to position · slide to zoom</b>
        <canvas ref={ref} width={S} height={S} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none' }} />
        <input type="range" min="100" max="300" value={Math.round(p.zoom * 100)} aria-label="Zoom" onChange={e => onChange({ zoom: e.target.value / 100 })} />
        <small>What you see inside the outline is exactly what we print.</small>
        <div className="ph-editor-btns">
          <button type="button" className="co-remove" onClick={onRemove}>Remove photo</button>
          <button type="button" className="btn btn-orange" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/**
 * lines: priced cart lines (q.lines) · value: { [productId]: [{ id, img, zoom, ox, oy, count }] }
 */
export default function PhotoStep({ lines, value, onChange, step }) {
  const [editing, setEditing] = useState(null); // { lineId, id }
  const [loading, setLoading] = useState('');
  const photoLines = lines.filter(l => photoSpec(l.id));
  if (!photoLines.length) return null;

  const setList = (lineId, fn) => onChange(v => ({ ...v, [lineId]: fn(v[lineId] || []) }));
  const patch = (lineId, id, ch) => setList(lineId, list => list.map(p => (p.id === id ? { ...p, ...ch } : p)));

  async function add(line, files) {
    setLoading(line.id);
    const added = [];
    for (const f of files) {
      if (!/^image\//.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) continue;
      try { added.push({ id: nextId++, img: await fileToCanvas(f), zoom: 1, ox: 0, oy: 0, count: 0 }); }
      catch { alert(`Couldn't open ${f.name}. Try saving it as a JPG or PNG first.`); }
    }
    setLoading('');
    if (!added.length) return;
    setList(line.id, list => {
      // the first and only photo for a line (a logo) fills every piece; otherwise one piece each
      const solo = !list.length && added.length === 1;
      return [...list, ...added.map(p => ({ ...p, count: solo ? line.qty : 1 }))];
    });
  }

  const ed = editing && (value[editing.lineId] || []).find(p => p.id === editing.id);

  return (
    <fieldset className="co-step">
      <legend><span>{step}</span> Your photos</legend>
      <p className="co-hint">Upload a photo for every piece and crop it to fit. <b>We print exactly what you see here</b>, with no proof step, so use your best original photos (no screenshots).</p>

      {photoLines.map(l => {
        const list = value[l.id] || [], round = photoSpec(l.id).shape === 'round';
        const n = assigned(list), left = l.qty - n;
        return (
          <div key={l.id} className="ph-line">
            <div className="ph-line-head">
              <b>{l.qty} × {l.name}</b>
              <span className={left === 0 ? 'ph-ok' : 'ph-left'}>
                {left === 0 ? '✓ All pieces have a photo' : left > 0 ? `${n} of ${l.qty} pieces · ${left} left` : `${-left} too many: lower a count`}
              </span>
            </div>
            <div className="ph-grid">
              {list.map(p => (
                <div key={p.id} className="ph-tile">
                  <button type="button" className="ph-pic" onClick={() => setEditing({ lineId: l.id, id: p.id })} aria-label="Adjust photo">
                    <Thumb p={p} round={round} />
                    <span>Adjust</span>
                  </button>
                  <div className="ph-count">
                    <button type="button" aria-label="One fewer" onClick={() => (p.count > 1 ? patch(l.id, p.id, { count: p.count - 1 }) : setList(l.id, ls => ls.filter(x => x.id !== p.id)))}>−</button>
                    <span>× {p.count}</span>
                    <button type="button" aria-label="One more" disabled={left <= 0} onClick={() => patch(l.id, p.id, { count: p.count + 1 })}>+</button>
                  </div>
                  {left > 0 && <button type="button" className="ph-fill" onClick={() => patch(l.id, p.id, { count: p.count + left })}>Use for the other {left}</button>}
                </div>
              ))}
              <label className={'ph-add' + (loading === l.id ? ' busy' : '')}>
                <input type="file" accept="image/*" multiple onChange={e => { const f = [...e.target.files]; e.target.value = ''; add(l, f); }} />
                <b>{loading === l.id ? 'Opening…' : '+ Add photos'}</b>
                <small>{round ? 'Round' : 'Square'} · one per piece</small>
              </label>
            </div>
          </div>
        );
      })}

      {ed && (
        <Editor
          p={ed} round={photoSpec(editing.lineId).shape === 'round'}
          onChange={ch => patch(editing.lineId, editing.id, ch)}
          onClose={() => setEditing(null)}
          onRemove={() => { setList(editing.lineId, ls => ls.filter(x => x.id !== editing.id)); setEditing(null); }}
        />
      )}
    </fieldset>
  );
}
