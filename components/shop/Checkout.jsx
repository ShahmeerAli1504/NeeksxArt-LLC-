'use client';
// Checkout (DEMO payments). Shows exactly how the total is built: tiered product pricing,
// delivery: free Reno/Sparks local delivery, or $8 flat-rate shipping (free out of state over $150), Nevada sales tax and the
// optional 50% deposit. The card form mimics Square's: any card is accepted and nothing is charged.
// Going live = swap DemoCardForm for Square's Web Payments SDK `card.tokenize()` (see README).
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, setQty, removeFromCart, clearCart } from '@/lib/cart';
import { quote, fmt, CHECKOUT, SHIPPING_SUMMARY, productById } from '@/lib/checkout';
import { pics } from '@/lib/catalog';

const METHODS = [
  { id: 'delivery', title: 'Free local delivery', sub: 'Reno & Sparks addresses' },
  { id: 'shipping', title: 'Shipping', sub: `${fmt(CHECKOUT.shipping.flatCents)} flat rate · free out of state over ${fmt(CHECKOUT.shipping.freeOverCents)}` }
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
  const [plan, setPlan] = useState('full');
  const [c, setC] = useState({ name: '', email: '', phone: '', line1: '', line2: '', city: '', state: 'NV', zip: '', note: '' });
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', zip: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const q = useMemo(() => quote({ items, method, zip: c.zip, state: c.state, plan }), [items, method, c.zip, c.state, plan]);
  const set = k => e => setC(v => ({ ...v, [k]: e.target.value }));
  const digits = card.number.replace(/\D/g, '');

  async function pay(e) {
    e.preventDefault();
    setErr('');
    if (!items.length) return setErr('Your cart is empty.');
    if (q.errors.length) return setErr(q.errors[0]);
    if (digits.length < 12) return setErr('Enter a card number (any number works in demo mode).');
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.exp)) return setErr('Enter the expiry as MM/YY.');
    if (!/^\d{3,4}$/.test(card.cvc)) return setErr('Enter the 3 or 4 digit security code.');
    setBusy(true);
    try {
      // Square would return a one-time token ("nonce") here. The full card number never leaves the browser.
      const sourceId = 'cnon:demo-' + Math.random().toString(36).slice(2, 12);
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, method, plan,
          customer: { name: c.name, email: c.email, phone: c.phone },
          address: { line1: c.line1, line2: c.line2, city: c.city, state: c.state, zip: c.zip },
          note: c.note,
          payment: { sourceId, brand: brandOf(digits), last4: digits.slice(-4), exp: card.exp.replace(/\s/g, ''), postal: card.zip },
          expectedTotal: q.total
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Payment failed. Please try again.');
      try { sessionStorage.setItem('neeksLastOrder', JSON.stringify(data.order)); } catch { /* ignore */ }
      clearCart();
      router.push('/checkout/success?order=' + encodeURIComponent(data.order.order_no));
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
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
        <div className="co-demo" role="note">
          <b>Demo checkout</b> No real payment is taken. Any card number is accepted, e.g. <code>4111 1111 1111 1111</code>, any future date, any CVC.
        </div>

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

        <fieldset className="co-step">
          <legend><span>3</span> Payment</legend>
          {q.depositAllowed && (
            <div className="co-plans">
              <label className={plan === 'full' ? 'on' : ''}>
                <input type="radio" name="plan" checked={plan === 'full'} onChange={() => setPlan('full')} />
                <b>Pay in full</b><small>{fmt(q.total)} today</small>
              </label>
              <label className={plan === 'deposit' ? 'on' : ''}>
                <input type="radio" name="plan" checked={plan === 'deposit'} onChange={() => setPlan('deposit')} />
                <b>Pay 50% deposit</b><small>{fmt(Math.round(q.total * CHECKOUT.deposit.share))} today · rest before {method === 'delivery' ? 'delivery' : 'shipping'}</small>
              </label>
            </div>
          )}
          <div className="sq-card">
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
          </div>
          {err && <p className="co-err" role="alert">{err}</p>}
          <button className="btn btn-orange co-pay" type="submit" disabled={busy || !ready}>
            {busy ? 'Processing…' : `Pay ${fmt(q.dueNow)}`}
          </button>
          <small className="co-fine">Payments are processed securely by Square. Production starts after your mockup is approved. See our <Link href="/policy">policy</Link>.</small>
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
                    {l.nextTier && <small className="co-next">Next tier: {l.nextTier}</small>}
                    <div className="co-line-qty">
                      <button type="button" aria-label="Fewer" onClick={() => setQty(l.id, l.qty - 1)}>−</button>
                      <input type="number" min="1" value={l.qty} aria-label={`Quantity of ${l.name}`} onChange={e => setQty(l.id, parseInt(e.target.value, 10) || 1)} />
                      <button type="button" aria-label="More" onClick={() => setQty(l.id, l.qty + 1)}>+</button>
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
            {q.plan === 'deposit' && (<>
              <dt>Due today (50%)</dt><dd>{fmt(q.dueNow)}</dd>
              <dt>Balance later</dt><dd>{fmt(q.balance)}</dd>
            </>)}
          </dl>
          {!q.depositAllowed && <small className="co-fine">Orders of {fmt(CHECKOUT.deposit.thresholdCents)}+ can pay a 50% deposit.</small>}
        </div>
      </aside>
    </form>
  );
}
