'use client';
import { useRef, useState } from 'react';

export default function ReviewForm({ products = [] }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState({ busy: false, done: false, error: '' });
  const started = useRef(Date.now());

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ busy: true, done: false, error: '' });
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.get('name'), rating, product: f.get('product'), body: f.get('body'), website: f.get('website'), elapsed: Date.now() - started.current })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Something went wrong.');
      setState({ busy: false, done: true, error: '' });
    } catch (err) { setState({ busy: false, done: false, error: err.message }); }
  }

  if (state.done) return <div className="rv-thanks"><b>Thank you!</b> Your review will show here as soon as Neeks approves it.</div>;
  return (
    <form className="rv-form" onSubmit={submit}>
      <div className="field">
        <span className="rv-label">Your rating <em>*</em></span>
        <div className="rv-stars-in" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={(hover || rating) >= n ? 'on' : ''} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>★</button>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div className="field"><label htmlFor="rvName">Your name <em>*</em></label><input id="rvName" name="name" required maxLength={60} autoComplete="name" /></div>
        <div className="field">
          <label htmlFor="rvProduct">What did you order?</label>
          <select id="rvProduct" name="product" defaultValue="">
            <option value="">Choose (optional)</option>
            {products.map(p => <option key={p}>{p}</option>)}
            <option>Live pop-up</option><option>Event favors</option><option>Other</option>
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="rvBody">Your review <em>*</em></label><textarea id="rvBody" name="body" required minLength={10} maxLength={1500} placeholder="How did your order turn out?" /></div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="rv-hp" aria-hidden="true" />
      {state.error && <p className="co-err" role="alert">{state.error}</p>}
      <button className="btn btn-orange" type="submit" disabled={state.busy || !rating}>{state.busy ? 'Sending…' : 'Post my review'}</button>
      <small className="rv-fine">Reviews appear after a quick check, so spam never makes it onto the page.</small>
    </form>
  );
}
