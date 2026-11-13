'use client';
// Square's Web Payments SDK card field. The card number is typed into Square's own secure iframe:
// it never touches our page or server. `tokenize()` returns a one-time token that /api/checkout charges.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const SDK = { sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js', production: 'https://web.squarecdn.com/v1/square.js' };

let sdkPromise = null;
function loadSdk(env) {
  if (typeof window !== 'undefined' && window.Square) return Promise.resolve(window.Square);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SDK[env] || SDK.sandbox;
    s.async = true;
    s.onload = () => (window.Square ? resolve(window.Square) : reject(new Error('Square did not load')));
    s.onerror = () => { sdkPromise = null; reject(new Error('Could not load Square')); };
    document.head.appendChild(s);
  });
  return sdkPromise;
}

/**
 * config = { appId, locationId, env }
 * ref.tokenize(verificationDetails) → { token, brand, last4 }  (throws with a customer-friendly message)
 */
const SquareCard = forwardRef(function SquareCard({ config }, ref) {
  const box = useRef(null);
  const card = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false, made = null;
    (async () => {
      try {
        const Square = await loadSdk(config.env);
        if (cancelled) return;
        const payments = Square.payments(config.appId, config.locationId);
        made = await payments.card();
        if (cancelled) { made.destroy(); return; }
        await made.attach(box.current);
        if (cancelled) { made.destroy(); return; }
        card.current = made;
        setState('ready');
      } catch (e) {
        console.error('square card', e);
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
      if (card.current === made) card.current = null;
      try { made?.destroy(); } catch { /* already gone */ }
    };
  }, [config.appId, config.locationId, config.env]);

  useImperativeHandle(ref, () => ({
    async tokenize(verificationDetails) {
      if (!card.current) throw new Error('The card form is still loading. Please wait a moment and try again.');
      let r;
      try { r = await card.current.tokenize(verificationDetails); }
      catch (e) { throw new Error(e?.message || 'Could not verify the card. Please try again.'); }
      if (r.status !== 'OK') {
        const msg = r.errors?.map(x => x.message).filter(Boolean)[0];
        throw new Error(msg || 'Please check your card details.');
      }
      const c = r.details?.card || {};
      return { token: r.token, brand: c.brand ? c.brand.charAt(0) + c.brand.slice(1).toLowerCase().replace(/_/g, ' ') : 'Card', last4: c.last4 || '' };
    }
  }), []);

  return (
    <div className="sq-card sq-live">
      <div className="sq-card-head"><span>Card</span><span className="sq-mark">▣ Square{config.env === 'sandbox' && <i>sandbox</i>}</span></div>
      <div className="sq-live-field" ref={box} />
      {state === 'loading' && <small className="sq-brand">Loading secure card form…</small>}
      {state === 'error' && <small className="sq-brand co-err">The card form couldn&apos;t load. Check your connection, then reload the page.</small>}
    </div>
  );
});

export default SquareCard;
