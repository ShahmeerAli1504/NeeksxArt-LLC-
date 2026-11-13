'use client';
// Checkout. Shows exactly how the total is built: tiered product pricing,
// delivery: free Reno/Sparks local delivery, or $8 flat-rate shipping (free out of state at $150 and over) and Nevada sales tax.
// Every order is paid in full. With Square keys set (see lib/payments.js) the card is entered in Square's
// own secure field and charged through Square; without them it's a demo form that accepts any card.
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, setQty, removeFromCart, clearCart } from '@/lib/cart';
import { quote, fmt, CHECKOUT, SHIPPING_SUMMARY, productById, LARGE_ORDER, needsTapLink } from '@/lib/checkout';
import { pics, isOrderableQty, bundlesFor, singleTier } from '@/lib/catalog';
import { cleanTapUrl } from '@/lib/bundles';
import { CONSENT, MINOR_NOTE, cleanConsent } from '@/lib/consent';
import QtyPicker from './QtyPicker';
import PhotoStep, { exportPhoto, assigned } from './PhotoStep';
import { photoSpec } from '@/lib/shop-photos';
import SquareCard from './SquareCard';

/** Yes / No cards for one permission question */
function Ask({ id, def, value, onChange }) {
  return (
    <div className="co-ask" role="radiogroup" aria-labelledby={id}>
      <p id={id} className="co-ask-q">{def.q} <em>*</em></p>
      <div className="co-methods co-methods-2">
        {[['yes', def.yes], ['no', def.no]].map(([v, label]) => (
          <label key={v} className={'co-method' + (value === v ? ' on' : '')}>
            <input type="radio" name={id} value={v} checked={value === v} onChange={() => onChange(v)} />
            <b>{label}</b>
          </label>
        ))}
      </div>
    </div>
  );
}

const METHODS = [
  { id: 'delivery', title: 'Free local delivery', sub: 'Reno & Sparks addresses' },
  { id: 'shipping', title: 'Shipping', sub: `${fmt(CHECKOUT.shipping.flatCents)} flat rate · free out of state at ${fmt(CHECKOUT.shipping.freeOverCents)} and over` }
];

const brandOf = n => /^4/.test(n) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'American Express' : /^6(011|5)/.test(n) ? 'Discover' : 'Card';
const groupCard = d => (/^3[47]/.test(d) ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, '$1 $2 $3') : d.replace(/(\d{4})(?=\d)/g, '$1 ')).trim();

function Explain({ lines }) {
  if (!lines?.length) return null;
  return (
    <details className="co-explain">
      <summary>How this was calculated</summary>
      <ul>{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </details>
  );
}

export default function Checkout() {
  const router = useRouter();
  const { items, ready } = useCart();
  const [method, setMethod] = useState('delivery');
  const [c, setC] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', state: 'NV', zip: '', note: '' });
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', zip: '' });
  const [busy, setBusy] = useState(false);
  const [busyText, setBusyText] = useState('');
  const [err, setErr] = useState('');
  const [photos, setPhotos] = useState({}); // { [productId]: [{ id, img, zoom, ox, oy, count }] }
  const [tapLinks, setTapLinks] = useState({}); // { [productId]: 'https://…' } for Tap-to-Connect lines
  const [tapChecked, setTapChecked] = useState({}); // { [productId]: true } once the customer confirms the link opens the right page
  const [consent, setConsent] = useState({ social: '', minor: '' }); // 'yes' | 'no'
  const [payCfg, setPayCfg] = useState(null); // null while loading · { mode: 'demo' } · { mode: 'square', appId, locationId, env } · { mode, error }
  const squareCard = useRef(null);

  useEffect(() => {
    let off = false;
    fetch('/api/checkout/config', { cache: 'no-store' })
      .then(r => r.json())
      .then(cfg => { if (!off) setPayCfg(cfg); })
      .catch(() => { if (!off) setPayCfg({ mode: 'square', error: 'Could not load the payment form. Check your connection and reload the page.' }); });
    return () => { off = true; };
  }, []);
  const isDemo = payCfg?.mode === 'demo';
  const squareOk = payCfg?.mode === 'square' && !payCfg.error;

  // carts saved before bundle-only pricing may hold a quantity that isn't orderable now: snap it to the
  // closest single quantity / bundle below it, and drop special-order items (those are email-only)
  useEffect(() => {
    if (!ready) return;
    items.forEach(i => {
      const p = productById(i.id);
      if (!p || p.special) return removeFromCart(i.id);
      if (isOrderableQty(p, i.qty)) return;
      const below = bundlesFor(p).filter(b => b.qty <= i.qty).pop();
      setQty(i.id, below ? below.qty : singleTier(p).max);
    });
  }, [items, ready]);

  const q = useMemo(() => quote({ items, method, zip: c.zip, state: c.state }), [items, method, c.zip, c.state]);
  const bigEmail = CHECKOUT.largeOrder.email;
  const set = k => e => setC(v => ({ ...v, [k]: e.target.value }));
  const digits = card.number.replace(/\D/g, '');
  const tapLines = q.lines.filter(l => needsTapLink(l.id));
  const hasPhotos = q.lines.some(l => photoSpec(l.id));
  const askStep = tapLines.length > 0 || hasPhotos; // tap links + photo permissions
  const payStep = 3 + (hasPhotos ? 1 : 0) + (askStep ? 1 : 0);

  async function pay(e) {
    e.preventDefault();
    setErr('');
    if (!items.length) return setErr('Your cart is empty.');
    if (q.errors.length) return setErr(q.errors[0]);
    const photoLines = q.lines.filter(l => photoSpec(l.id));
    const short = photoLines.find(l => assigned(photos[l.id]) !== l.qty);
    if (short) {
      const n = assigned(photos[short.id]);
      return setErr(n < short.qty ? `Add photos for all ${short.qty} ${short.name} (${n} so far).` : `${short.name}: you have photos for ${n} pieces but ordered ${short.qty}. Lower a count.`);
    }
    const noLink = tapLines.find(l => !cleanTapUrl(tapLinks[l.id]));
    if (noLink) return setErr(tapLinks[noLink.id] ? `Check the tap link for ${noLink.name}.` : `Add the tap link for ${noLink.name}.`);
    const unchecked = tapLines.find(l => !tapChecked[l.id]);
    if (unchecked) return setErr(`Open your tap link for ${unchecked.name} and tick the box to confirm it goes to the right page.`);
    if (hasPhotos && !cleanConsent(consent)) return setErr('Please answer both photo permission questions.');
    if (!payCfg) return setErr('The payment form is still loading. Please wait a moment.');
    if (payCfg.error) return setErr(payCfg.error);
    if (isDemo) {
      if (digits.length < 12) return setErr('Enter a card number (any number works in demo mode).');
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.exp)) return setErr('Enter the expiry as MM/YY.');
      if (!/^\d{3,4}$/.test(card.cvc)) return setErr('Enter the 3 or 4 digit security code.');
    }
    setBusy(true);
    try {
      // 0. card → one-time Square token (checks the card details before anything is uploaded)
      let payment;
      if (isDemo) {
        payment = { sourceId: 'cnon:demo-' + Math.random().toString(36).slice(2, 12), brand: brandOf(digits), last4: digits.slice(-4), exp: card.exp.replace(/\s/g, ''), postal: card.zip };
      } else {
        setBusyText('Checking card…');
        const [givenName, ...rest] = c.name.trim().split(/\s+/);
        const t = await squareCard.current?.tokenize({
          amount: (q.dueNow / 100).toFixed(2), currencyCode: 'USD', intent: 'CHARGE',
          customerInitiated: true, sellerKeyedIn: false,
          billingContact: {
            givenName, familyName: rest.join(' ') || undefined, email: c.email || undefined, phone: c.phone || undefined,
            addressLines: [c.line1, c.line2].filter(Boolean), city: c.city || undefined, state: c.state || undefined,
            postalCode: c.zip || undefined, countryCode: 'US'
          }
        });
        if (!t) throw new Error('The card form is still loading. Please wait a moment and try again.');
        payment = { sourceId: t.token, brand: t.brand, last4: t.last4 };
      }
      // 1. upload the cropped photos straight to storage (before the card is charged)
      let photoPayload = null;
      const all = photoLines.flatMap(l => photos[l.id].map(p => ({ lineId: l.id, p })));
      if (all.length) {
        setBusyText('Preparing photos…');
        const pre = await fetch('/api/checkout/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: all.length }) })
          .then(r => r.json()).catch(() => ({}));
        if (!pre.ok) throw new Error(pre.error || 'Could not upload your photos. Please try again.');
        if (pre.mode === 'storage') {
          const { uploadToSignedUrl } = await import('@/lib/supabase/browser');
          let done = 0;
          const queue = all.map((x, i) => ({ ...x, u: pre.uploads[i] }));
          const work = queue.slice();
          const worker = async () => {
            while (work.length) {
              const { p, u } = work.shift();
              await uploadToSignedUrl(pre.bucket, u.path, u.token, await exportPhoto(p));
              setBusyText(`Uploading photos ${++done} of ${all.length}…`);
            }
          };
          await Promise.all([worker(), worker(), worker()]);
          const lines = {};
          queue.forEach(({ lineId, p, u }) => (lines[lineId] ||= []).push({ path: u.path, count: p.count }));
          photoPayload = { uploadId: pre.uploadId, lines };
        }
      }
      setBusyText('Processing payment…');
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, method,
          customer: { name: c.name, email: c.email, phone: c.phone },
          address: { line1: c.line1, line2: c.line2, city: c.city, state: c.state, zip: c.zip },
          note: c.note,
          payment,
          expectedTotal: q.total,
          photos: photoPayload,
          tapLinks: Object.fromEntries(tapLines.map(l => [l.id, cleanTapUrl(tapLinks[l.id])])),
          consent: hasPhotos ? cleanConsent(consent) : null
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Payment failed. Please try again.');
      try { sessionStorage.setItem('neeksLastOrder', JSON.stringify(data.order)); } catch { /* ignore */ }
      clearCart();
      router.push('/checkout/success?order=' + encodeURIComponent(data.order.order_no));
    } catch (e2) {
      setErr(e2.message === 'Failed to fetch' ? 'Connection problem. Check your connection and try again.' : e2.message);
      setBusy(false);
      setBusyText('');
    }
  }

  if (ready && !items.length) {
    return (
      <div className="co-empty">
        <h2>Your cart is empty</h2>
        <p>Add a few products from the catalog to see how checkout, delivery and tax work.</p>
        <Link className="btn btn-orange" href="/catalog">Browse the catalog</Link>
      </div>
    );
  }

  return (
    <form className="co" onSubmit={pay} noValidate>
      <div className="co-main">
        {isDemo && (
          <div className="co-demo" role="note">
            <b>Demo checkout</b> No real payment is taken. Any card number is accepted, e.g. <code>4111 1111 1111 1111</code>, any future date, any CVC.
          </div>
        )}
        {squareOk && payCfg.env === 'sandbox' && (
          <div className="co-demo" role="note">
            <b>Square sandbox</b> Test payments only, no real money moves. Use Square&apos;s test card <code>4111 1111 1111 1111</code>, any future date, CVV <code>111</code>, any ZIP.
          </div>
        )}

        <fieldset className="co-step">
          <legend><span>1</span> Your details</legend>
          <div className="field-row">
            <div className="field"><label htmlFor="coName">Full name <em>*</em></label><input id="coName" required autoComplete="name" value={c.name} onChange={set('name')} /></div>
            <div className="field"><label htmlFor="coPhone">Phone</label><input id="coPhone" type="tel" autoComplete="tel" value={c.phone} onChange={set('phone')} /></div>
          </div>
          <div className="field"><label htmlFor="coEmail">Email <em>*</em></label><input id="coEmail" type="email" required autoComplete="email" value={c.email} onChange={set('email')} /></div>
        </fieldset>

        <fieldset className="co-step">
          <legend><span>2</span> How do you want it?</legend>
          <div className="co-methods co-methods-2" role="radiogroup">
            {METHODS.map(m => (
              <label key={m.id} className={'co-method' + (method === m.id ? ' on' : '')}>
                <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                <b>{m.title}</b><small>{m.sub}</small>
              </label>
            ))}
          </div>

          {method === 'delivery' && <p className="co-hint co-note"><b>Free in Reno &amp; Sparks.</b> {CHECKOUT.delivery.note}</p>}
          {method === 'shipping' && (
            <p className="co-hint co-note">{SHIPPING_SUMMARY.shipping}. {SHIPPING_SUMMARY.free}.</p>
          )}

          {(
            <>
              <div className="field"><label htmlFor="coL1">Street address <em>*</em></label><input id="coL1" autoComplete="address-line1" value={c.line1} onChange={set('line1')} /></div>
              <div className="field"><label htmlFor="coL2">Apt / suite</label><input id="coL2" autoComplete="address-line2" value={c.line2} onChange={set('line2')} /></div>
              <div className="field-row co-row3">
                <div className="field"><label htmlFor="coCity">City <em>*</em></label><input id="coCity" autoComplete="address-level2" value={c.city} onChange={set('city')} /></div>
                <div className="field"><label htmlFor="coState">State</label><input id="coState" autoComplete="address-level1" maxLength={2} value={c.state} onChange={e => setC(v => ({ ...v, state: e.target.value.toUpperCase() }))} /></div>
                <div className="field"><label htmlFor="coZip">ZIP <em>*</em></label><input id="coZip" inputMode="numeric" autoComplete="postal-code" maxLength={10} value={c.zip} onChange={set('zip')} /></div>
              </div>
            </>
          )}

          <div className="field"><label htmlFor="coNote">Order note</label><input id="coNote" value={c.note} onChange={set('note')} placeholder="Deadline, colors, anything we should know" /></div>
        </fieldset>

        <PhotoStep lines={q.lines} value={photos} onChange={setPhotos} step={3} />

        {askStep && (
          <fieldset className="co-step">
            <legend><span>{hasPhotos ? 4 : 3}</span> {tapLines.length ? 'Tap link & permissions' : 'Photo permissions'}</legend>
            {tapLines.map(l => {
              const raw = tapLinks[l.id] || '', url = cleanTapUrl(raw), bad = !!raw.trim() && !url;
              return (
                <div className="field" key={l.id}>
                  <label htmlFor={`coTap-${l.id}`}>Tap link for {l.qty} × {l.name} <em>*</em></label>
                  <input id={`coTap-${l.id}`} type="url" inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck="false" maxLength={300}
                    placeholder="https://instagram.com/yourname" aria-invalid={bad} value={raw}
                    onChange={e => { const v = e.target.value; setTapLinks(x => ({ ...x, [l.id]: v })); setTapChecked(x => ({ ...x, [l.id]: false })); }} />
                  <small className="co-hint co-tap-hint">{bad ? 'That doesn’t look like a web link. Check for typos, like a double dot or a missing .com. Example: instagram.com/yourname' : 'We program the NFC chip in every keychain so any phone opens this link with a tap. No app needed.'}</small>
                  {url && (
                    <div className="co-tap-check">
                      <p>Your keychains will open: <b>{url}</b> <a href={url} target="_blank" rel="noopener noreferrer">Test my link ↗</a></p>
                      <label>
                        <input type="checkbox" checked={!!tapChecked[l.id]} onChange={e => setTapChecked(x => ({ ...x, [l.id]: e.target.checked }))} />
                        <span>I opened my link and it goes to the right page <em>*</em></span>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
            {hasPhotos && (
              <>
                <Ask id="coSocial" def={CONSENT.social} value={consent.social} onChange={v => setConsent(c => ({ ...c, social: v }))} />
                <Ask id="coMinor" def={CONSENT.minor} value={consent.minor} onChange={v => setConsent(c => ({ ...c, minor: v }))} />
                {consent.minor === 'yes' && <p className="co-hint co-note">{MINOR_NOTE}</p>}
              </>
            )}
          </fieldset>
        )}

        <fieldset className="co-step">
          <legend><span>{payStep}</span> Payment</legend>
          {q.largeOrder && (
            <p className="co-hint co-note">
              <b>Ordering {LARGE_ORDER} or more?</b> Email us at{' '}
              <a href={`mailto:${bigEmail}?subject=${encodeURIComponent('Large order inquiry')}`}>{bigEmail}</a>{' '}
              before you pay and we&apos;ll work out the order and payment with you.
            </p>
          )}
          {!payCfg && <div className="sq-card"><small className="sq-brand">Loading secure card form…</small></div>}
          {payCfg?.error && <p className="co-err" role="alert">{payCfg.error} Nothing will be charged. Please try again shortly or email us.</p>}
          {squareOk && <SquareCard ref={squareCard} config={payCfg} />}
          {isDemo && <div className="sq-card">
            <div className="sq-card-head"><span>Card</span><span className="sq-mark">▣ Square <i>demo</i></span></div>
            <div className="sq-fields">
              <input className="sq-num" aria-label="Card number" placeholder="Card number" inputMode="numeric" autoComplete="cc-number"
                value={groupCard(digits)} onChange={e => setCard(v => ({ ...v, number: e.target.value.replace(/\D/g, '').slice(0, 19) }))} />
              <input aria-label="Expiry MM/YY" placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" maxLength={5}
                value={card.exp} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setCard(v => ({ ...v, exp: d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d })); }} />
              <input aria-label="Security code" placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" maxLength={4}
                value={card.cvc} onChange={e => setCard(v => ({ ...v, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
              <input aria-label="Billing ZIP" placeholder="ZIP" inputMode="numeric" autoComplete="postal-code" maxLength={5}
                value={card.zip} onChange={e => setCard(v => ({ ...v, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))} />
            </div>
            {digits.length >= 2 && <small className="sq-brand">{brandOf(digits)}</small>}
          </div>}
          {err && <p className="co-err" role="alert">{err}</p>}
          <button className="btn btn-orange co-pay" type="submit" disabled={busy || !ready || !payCfg || !!payCfg.error}>
            {busy ? (busyText || 'Processing…') : `Pay ${fmt(q.dueNow)}`}
          </button>
          <small className="co-fine">Payments are processed securely by Square. We print exactly the photos you upload and crop, with no proof step. See our <Link href="/policy">policy</Link>.</small>
        </fieldset>
      </div>

      <aside className="co-side">
        <div className="co-summary">
          <h3>Order summary</h3>
          <ul className="co-lines">
            {q.lines.map(l => {
              const p = productById(l.id);
              return (
                <li key={l.id}>
                  <img src={pics(p)[0]} alt="" />
                  <div className="co-line-main">
                    <b>{l.name}</b>
                    <small>{l.tierNote}</small>
                    {l.nextTier && <small className="co-next">Save with the {l.nextTier}</small>}
                    <div className="co-line-qty">
                      <QtyPicker product={p} value={l.qty} variant="select" onChange={n => setQty(l.id, n)} />
                      <button type="button" className="co-remove" onClick={() => removeFromCart(l.id)}>Remove</button>
                    </div>
                  </div>
                  <span className="co-line-total">{fmt(l.totalCents)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="co-totals">
            <dt>Subtotal</dt><dd>{fmt(q.subtotal)}</dd>
            <dt>{method === 'delivery' ? 'Delivery' : 'Shipping'}<small>{q.delivery.label}</small></dt>
            <dd>{q.delivery.amount ? fmt(q.delivery.amount) : 'Free'}</dd>
            <dd className="co-x"><Explain lines={q.delivery.explain} /></dd>
            <dt>Sales tax<small>{q.tax.rate ? (q.tax.rate * 100).toFixed(3).replace(/0+$/, '') + '%' : ''}</small></dt><dd>{fmt(q.tax.amount)}</dd>
            <dd className="co-x"><Explain lines={[q.tax.explain, 'Tax is charged on products only, not on delivery or shipping']} /></dd>
            <dt className="co-grand">Total</dt><dd className="co-grand">{fmt(q.total)}</dd>
          </dl>
          <small className="co-fine">Orders are paid in full at checkout. Ordering {LARGE_ORDER} or more? Email <a href={`mailto:${bigEmail}?subject=${encodeURIComponent('Large order inquiry')}`}>{bigEmail}</a>.</small>
        </div>
      </aside>
    </form>
  );
}
