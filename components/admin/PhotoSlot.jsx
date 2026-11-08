'use client';
// One of a product's 4 photo slots on Dashboard → Product photos.
import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function resize(file, max, quality) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return new Promise(ok => c.toBlob(b => ok(b), 'image/jpeg', quality));
}

export default function PhotoSlot({ id, slot, src, custom, name }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function upload(file) {
    if (!file) return;
    setErr(''); setBusy('Uploading…');
    try {
      const fd = new FormData();
      fd.append('id', id); fd.append('slot', String(slot));
      fd.append('image', await resize(file, 1600, 0.88), 'photo.jpg');
      fd.append('thumb', await resize(file, 320, 0.8), 'thumb.jpg');
      const r = await fetch('/api/admin/product-photo', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Upload failed');
      router.refresh();
    } catch (e) { setErr(e.message); }
    finally { setBusy(''); }
  }
  async function reset() {
    setErr(''); setBusy('Resetting…');
    try {
      const r = await fetch(`/api/admin/product-photo?id=${encodeURIComponent(id)}&slot=${slot}`, { method: 'DELETE' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Reset failed');
      router.refresh();
    } catch (e) { setErr(e.message); }
    finally { setBusy(''); }
  }

  return (
    <div className={`ph-slot${src ? '' : ' empty'}`}>
      <span className="ph-n">{slot}</span>
      {src ? <img src={src} alt={`${name} photo ${slot}`} loading="lazy" /> : <span className="ph-missing">No photo yet</span>}
      {custom && <span className="ph-tag">Updated</span>}
      <div className="ph-actions">
        <label className="ph-btn">
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={!!busy} onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          {busy || (src ? 'Replace' : 'Add photo')}
        </label>
        {custom && !busy && <button type="button" className="ph-reset" onClick={reset}>Reset</button>}
      </div>
      {err && <small className="ph-err">{err}</small>}
    </div>
  );
}
