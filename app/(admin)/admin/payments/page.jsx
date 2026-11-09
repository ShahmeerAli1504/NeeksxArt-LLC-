import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { listOrders } from '@/lib/shop-orders';
import { setShopStatus, collectBalance, refundOrder, deleteDemoOrders } from '@/lib/shop-actions';
import { fmt, CHECKOUT } from '@/lib/checkout';
import { paymentsMode } from '@/lib/payments';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

const VIEWS = {
  all: { label: 'All', test: () => true },
  balance: { label: 'Balance due', test: o => o.payment_status === 'deposit' },
  open: { label: 'In progress', test: o => ['new', 'in_production', 'ready'].includes(o.status) },
  completed: { label: 'Completed', test: o => o.status === 'completed' },
  refunded: { label: 'Refunded', test: o => o.payment_status === 'refunded' }
};
const STATUS = { new: 'New', in_production: 'In production', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };
const NEXT = { new: 'in_production', in_production: 'ready', ready: 'completed' };
const PAY = { paid: 'Paid in full', deposit: 'Deposit paid', refunded: 'Refunded' };
const METHOD = { pickup: 'Pickup', delivery: 'Local delivery', shipping: 'Shipping' }; // pickup: older demo orders
const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
const pct = r => r ? (r * 100).toFixed(3).replace(/\.?0+$/, '') + '%' : '0%';

export default async function PaymentsPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const view = VIEWS[sp?.view] ? sp.view : 'all';
  let orders = [], storage = 'memory', loadError = '';
  try { ({ orders, storage } = await listOrders()); } catch (e) { loadError = e.message; }

  const live = orders.filter(o => o.payment_status !== 'refunded');
  const sum = (list, k) => list.reduce((a, o) => a + (o.amounts?.[k] || 0), 0);
  const stats = [
    ['Orders', String(live.length), `${orders.length - live.length} refunded`],
    ['Collected', fmt(sum(live, 'paid')), 'card payments received'],
    ['Balance due', fmt(sum(live, 'balance')), 'deposits still owed'],
    ['Product sales', fmt(sum(live, 'subtotal')), 'before delivery & tax'],
    ['Delivery & shipping', fmt(sum(live, 'delivery')), 'charged to customers'],
    ['Sales tax', fmt(sum(live, 'tax')), 'owed to Nevada'],
    ['Square fees', fmt(sum(orders, 'fees')), '2.9% + 30¢ per payment'],
    ['Net to NeeksxArt', fmt(sum(live, 'net') + sum(orders.filter(o => o.payment_status === 'refunded'), 'net')), 'collected − fees']
  ];
  const shown = orders.filter(VIEWS[view].test);
  const demoCount = orders.filter(o => o.demo).length;

  return (
    <>
      <AdminNav active="payments" />
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Payments</h1>
            <p>Online orders from the website checkout. {paymentsMode() === 'demo' ? 'Demo mode: every card is approved and nothing is charged.' : 'Live Square payments.'}</p>
          </div>
          {demoCount > 0 && (
            <form action={deleteDemoOrders}><button className="adm-link" type="submit">Delete {demoCount} demo order{demoCount > 1 ? 's' : ''}</button></form>
          )}
        </div>

        {storage === 'memory' && (
          <p className="pay-warn">Orders are only kept in this server&apos;s memory right now. Run <code>supabase/shop-orders.sql</code> in Supabase → SQL Editor so they&apos;re saved permanently.</p>
        )}
        {loadError && <p className="pay-warn">Couldn&apos;t load orders: {loadError}</p>}

        <div className="pay-stats">
          {stats.map(([k, v, s]) => <div key={k}><small>{k}</small><b>{v}</b><span>{s}</span></div>)}
        </div>

        <details className="pay-rules">
          <summary>How checkout calculates delivery, tax and fees</summary>
          <ul>
            <li><b>Free local delivery:</b> Reno &amp; Sparks ZIP codes. If we can&apos;t deliver (weather, emergency), the order ships under the normal terms.</li>
            <li><b>Shipping:</b> {fmt(CHECKOUT.shipping.flatCents)} flat rate under {fmt(CHECKOUT.shipping.freeOverCents)} · free on out-of-state orders of {fmt(CHECKOUT.shipping.freeOverCents)} and over (merchandise subtotal before tax; {CHECKOUT.shipping.noFreeStates.join(' & ')} excluded).</li>
            <li><b>Sales tax</b> on products only: {CHECKOUT.tax.zones.map(z => `${z.label} ${pct(z.rate)}`).join(' · ')} · other NV {pct(CHECKOUT.tax.nevadaDefault.rate)} · out of state 0%.</li>
            <li><b>Deposit:</b> orders {fmt(CHECKOUT.deposit.thresholdCents)}+ can pay {CHECKOUT.deposit.share * 100}% now, the rest before delivery.</li>
            <li><b>Square fee:</b> {pct(CHECKOUT.square.pct)} + {fmt(CHECKOUT.square.fixedCents)} on each card payment, paid by NeeksxArt.</li>
            <li className="pay-muted">All of these are set in <code>lib/checkout.js</code>. Confirm the tax rates before going live.</li>
          </ul>
        </details>

        <div className="adm-filters">
          <div className="adm-tabs">
            {Object.entries(VIEWS).map(([k, v]) => (
              <Link key={k} href={k === 'all' ? '/admin/payments' : `/admin/payments?view=${k}`} className={k === view ? 'on' : ''}>
                {v.label} <span className="pay-n">{orders.filter(v.test).length}</span>
              </Link>
            ))}
          </div>
        </div>

        {!shown.length && <p className="adm-empty">No orders here yet. Place a test order at <Link href="/catalog" target="_blank">the catalog</Link> → Add to cart → Checkout.</p>}

        <div className="pay-list">
          {shown.map(o => {
            const a = o.amounts || {}, f = o.fulfillment || {}, c = o.customer || {};
            return (
              <article key={o.id} className={`pay-order ps-${o.payment_status}`}>
                <header className="pay-head">
                  <div>
                    <div className="adm-num">{o.order_no} {o.demo && <span className="pay-demo">Demo</span>}</div>
                    <div className="adm-who">{c.name} · {time(o.created_at)}</div>
                  </div>
                  <div className="pay-pills">
                    <span className={`pay-pill pp-${o.payment_status}`}>{PAY[o.payment_status] || o.payment_status}</span>
                    <span className="adm-pill">{STATUS[o.status] || o.status}</span>
                  </div>
                </header>

                <div className="pay-cols">
                  <div>
                    <h4>Items</h4>
                    <table className="pay-items">
                      <tbody>
                        {(o.items || []).map(l => (
                          <tr key={l.id}><td><b>{l.qty} ×</b> {l.name}<small>{l.tierNote}</small></td><td>{fmt(l.totalCents)}</td></tr>
                        ))}
                      </tbody>
                    </table>

                    <h4>{METHOD[f.method] || 'Fulfillment'}</h4>
                    <p className="pay-ful"><b>{f.label}</b>
                      {f.address && <><br />{f.address.line1}{f.address.line2 ? `, ${f.address.line2}` : ''}<br />{f.address.city}, {f.address.state} {f.address.zip}</>}
                    </p>
                    <ul className="pay-explain">{(f.explain || []).map((e, i) => <li key={i}>{e}</li>)}</ul>

                    <h4>Customer</h4>
                    <p className="pay-ful"><a href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <> · <a href={`tel:${c.phone}`}>{c.phone}</a></>}</p>
                    {o.note && <p className="pay-ful"><b>Note:</b> {o.note}</p>}
                  </div>

                  <div>
                    <h4>Money</h4>
                    <dl className="pay-money">
                      <dt>Products</dt><dd>{fmt(a.subtotal)}</dd>
                      <dt>{METHOD[f.method] || 'Delivery'}</dt><dd>{a.delivery ? fmt(a.delivery) : 'Free'}</dd>
                      <dt>Sales tax <small>{a.tax_explain || o.tax_label}</small></dt><dd>{fmt(a.tax)}</dd>
                      <dt className="pm-total">Order total</dt><dd className="pm-total">{fmt(a.total)}</dd>
                      <dt>Collected</dt><dd>{fmt(a.paid)}</dd>
                      {a.balance > 0 && (<><dt className="pm-due">Balance due</dt><dd className="pm-due">{fmt(a.balance)}</dd></>)}
                      {a.refunded > 0 && (<><dt className="pm-due">Refunded</dt><dd className="pm-due">−{fmt(a.refunded)}</dd></>)}
                      <dt>Square fees</dt><dd>−{fmt(a.fees)}</dd>
                      <dt className="pm-net">Net to NeeksxArt</dt><dd className={`pm-net${a.net < 0 ? ' pm-neg' : ''}`}>{fmt(a.net)}</dd>
                    </dl>
                    <h4>Transactions</h4>
                    <ul className="pay-tx">
                      {(o.payments || []).map(p => (
                        <li key={p.id}>
                          <span>{{ charge: o.amounts?.plan === 'deposit' ? 'Deposit' : 'Payment', balance: 'Balance', refund: 'Refund' }[p.kind] || p.kind}</span>
                          <span>{p.brand ? `${p.brand} •••• ${p.last4}` : ''}</span>
                          <b>{fmt(p.amount)}</b>
                          <small>{time(p.at)} · {p.id}{p.fee ? ` · fee ${fmt(p.fee)}` : ''}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="adm-actions">
                  {NEXT[o.status] && o.payment_status !== 'refunded' && (
                    <form action={setShopStatus}>
                      <input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={NEXT[o.status]} />
                      <button className="btn btn-orange" type="submit">Mark {STATUS[NEXT[o.status]].toLowerCase()}</button>
                    </form>
                  )}
                  {o.payment_status === 'deposit' && (
                    <form action={collectBalance}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="btn btn-ghost pay-collect" type="submit">Collect balance {fmt(a.balance)}</button>
                    </form>
                  )}
                  {o.payment_status !== 'refunded' && (
                    <form action={refundOrder}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className="adm-link" type="submit">Refund {fmt(a.paid)}</button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
