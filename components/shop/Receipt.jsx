'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fmt } from '@/lib/checkout';

export default function Receipt() {
  const [o, setO] = useState(undefined);
  useEffect(() => {
    try { setO(JSON.parse(sessionStorage.getItem('neeksLastOrder') || 'null')); } catch { setO(null); }
  }, []);
  if (o === undefined) return null;
  if (!o) return (
    <div className="co-empty"><h2>Order placed</h2><p>Check your email for the receipt.</p><Link className="btn btn-orange" href="/catalog">Back to the catalog</Link></div>
  );
  const a = o.amounts, f = o.fulfillment, pay = (o.payments || [])[0] || {};
  return (
    <div className="rc">
      <div className="rc-head">
        <div><small>Order</small><b>{o.order_no}</b></div>
        <div><small>Paid today</small><b>{fmt(a.paid)}</b></div>
        <div><small>Card</small><b>{pay.brand} •••• {pay.last4}</b></div>
      </div>
      {o.demo && <p className="co-demo"><b>Demo</b> This was a test payment. No card was charged.</p>}
      <table className="rc-table">
        <tbody>
          {o.items.map(l => <tr key={l.id}><td>{l.qty} × {l.name}<small>{l.tierNote}</small></td><td>{fmt(l.totalCents)}</td></tr>)}
          <tr className="rc-sub"><td>Subtotal</td><td>{fmt(a.subtotal)}</td></tr>
          <tr><td>{f.label}</td><td>{a.delivery ? fmt(a.delivery) : 'Free'}</td></tr>
          <tr><td>Sales tax <small>{o.tax_label}</small></td><td>{fmt(a.tax)}</td></tr>
          <tr className="rc-total"><td>Total</td><td>{fmt(a.total)}</td></tr>
          <tr><td>Paid today</td><td>{fmt(a.paid)}</td></tr>
          {a.balance > 0 && <tr className="rc-bal"><td>Balance due before {f.method === 'delivery' ? 'delivery' : 'shipping'}</td><td>{fmt(a.balance)}</td></tr>}
        </tbody>
      </table>
      <p className="rc-next">
        {f.method === 'delivery' && `Next: we print your order exactly as you uploaded it, then deliver to ${f.address?.line1}, ${f.address?.city}. If weather or an emergency means we can't deliver, we'll ship it instead and the standard $8.00 shipping fee applies.`}
        {f.method === 'shipping' && `Next: we print your order exactly as you uploaded it, then ship it with tracking. Standard shipping takes 7–10 business days, but may take longer due to the holidays.`}
      </p>
      <Link className="btn btn-orange" href="/catalog">Keep shopping</Link>
    </div>
  );
}
