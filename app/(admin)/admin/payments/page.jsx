import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { listOrders } from '@/lib/shop-orders';
import { setShopStatus, collectBalance, refundOrder, deleteDemoOrders } from '@/lib/shop-actions';
import { fmt, CHECKOUT, LARGE_ORDER } from '@/lib/checkout';
import { paymentsMode, squareEnv } from '@/lib/payments';
import AdminNav from '@/components/admin/AdminNav';
import { signedUrls, BUCKETS } from '@/lib/supabase/admin';
import { photoSpec } from '@/lib/shop-photos';
import { canPost } from '@/lib/consent';

/** pieces that go on the print sheet (lines with a template) */
const sheetPieces = o => (o.items || []).filter(l => photoSpec(l.id)?.sheet)
  .reduce((a, l) => a + (l.photos || []).reduce((b, p) => b + p.count, 0), 0);

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
const MAIL = { sent: '✓ Sent', failed: '✕ Failed', not_configured: 'Not sent (email not set up)' };
const METHOD = { pickup: 'Pickup', delivery: 'Local delivery', shipping: 'Shipping' }; // pickup: older demo orders
const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
const pct = r => r ? (r * 100).toFixed(3).replace(/\.?0+$/, '') + '%' : '0%';

// ---- filters (date range, real vs test, search) — they narrow the totals and the list together ----
const TZ = 'America/Los_Angeles';
const dayOf = d => new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD in Reno time
const addDays = (ymd, n) => { const t = new Date(ymd + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const PERIODS = { all: 'All time', today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days', month: 'This month', custom: 'Custom' };
const KINDS = { all: 'Real + test', real: 'Real only', test: 'Test only' };

function readFilters(sp = {}) {
  const today = dayOf(Date.now());
  let period = PERIODS[sp.period] ? sp.period : 'all';
  let from = YMD.test(sp.from || '') ? sp.from : '', to = YMD.test(sp.to || '') ? sp.to : '';
  if ((from || to) && !sp.period) period = 'custom';
  if (period === 'today') from = to = today;
  else if (period === '7d') { from = addDays(today, -6); to = today; }
  else if (period === '30d') { from = addDays(today, -29); to = today; }
  else if (period === 'month') { from = today.slice(0, 8) + '01'; to = today; }
  else if (period === 'all') from = to = '';
  if (from && to && from > to) [from, to] = [to, from];
  return { period, from, to, kind: KINDS[sp.kind] ? sp.kind : 'all', q: String(sp.q || '').trim().slice(0, 80) };
}

function matches(o, f) {
  if (f.kind === 'real' && o.demo) return false;
  if (f.kind === 'test' && !o.demo) return false;
  if (f.from || f.to) {
    const d = dayOf(o.created_at);
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
  }
  if (f.q) {
    const c = o.customer || {}, needle = f.q.toLowerCase(), digits = f.q.replace(/\D/g, '');
    const hay = [o.order_no, c.name, c.email, o.note, ...(o.items || []).map(l => l.name), ...(o.payments || []).map(p => p.id)].join(' ').toLowerCase();
    if (!hay.includes(needle) && !(digits.length >= 4 && String(c.phone || '').replace(/\D/g, '').includes(digits))) return false;
  }
  return true;
}

/** /admin/payments?… keeping the current filters, with `patch` applied (defaults left out of the URL) */
function hrefWith(cur, patch) {
  const v = { ...cur, ...patch }, p = new URLSearchParams();
  if (v.view && v.view !== 'all') p.set('view', v.view);
  if (v.period && v.period !== 'all') p.set('period', v.period);
  if (v.period === 'custom') { if (v.from) p.set('from', v.from); if (v.to) p.set('to', v.to); }
  if (v.kind && v.kind !== 'all') p.set('kind', v.kind);
  if (v.q) p.set('q', v.q);
  const s = p.toString();
  return '/admin/payments' + (s ? '?' + s : '');
}

export default async function PaymentsPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const view = VIEWS[sp?.view] ? sp.view : 'all';
  const filt = readFilters(sp);
  const cur = { view, ...filt };
  const filtered = filt.period !== 'all' || filt.kind !== 'all' || !!filt.q;
  let allOrders = [], storage = 'memory', loadError = '';
  try { ({ orders: allOrders, storage } = await listOrders()); } catch (e) { loadError = e.message; }
  const orders = allOrders.filter(o => matches(o, filt));

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
  // customer photos on the orders shown: thumbnails + one-click downloads (links last an hour)
  const photoPaths = shown.flatMap(o => (o.items || []).flatMap(l => (l.photos || []).map(p => p.path)));
  const [viewUrls, downloadUrls] = await Promise.all([
    signedUrls(BUCKETS.uploads, photoPaths, 60 * 60),
    signedUrls(BUCKETS.uploads, photoPaths, 60 * 60, { download: true })
  ]);
  const demoCount = allOrders.filter(o => o.demo).length;
  const modeText = paymentsMode() === 'demo' ? 'Demo mode: every card is approved and nothing is charged.'
    : squareEnv() === 'sandbox' ? 'Square sandbox: test payments only, no real money moves.' : 'Live Square payments.';

  return (
    <>
      <AdminNav active="payments" />
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Payments</h1>
            <p>Online orders from the website checkout. {modeText}</p>
          </div>
          {demoCount > 0 && (
            <form action={deleteDemoOrders}><button className="adm-link" type="submit">Delete {demoCount} demo order{demoCount > 1 ? 's' : ''}</button></form>
          )}
        </div>

        {storage === 'memory' && (
          <p className="pay-warn">Orders are only kept in this server&apos;s memory right now. Run <code>supabase/shop-orders.sql</code> in Supabase → SQL Editor so they&apos;re saved permanently.</p>
        )}
        {loadError && <p className="pay-warn">Couldn&apos;t load orders: {loadError}</p>}

        <form className="pay-filter" action="/admin/payments" method="get">
          {view !== 'all' && <input type="hidden" name="view" value={view} />}
          <div className="adm-tabs">
            {Object.entries(PERIODS).filter(([k]) => k !== 'custom').map(([k, label]) => (
              <Link key={k} href={hrefWith(cur, { period: k })} className={filt.period === k ? 'on' : ''}>{label}</Link>
            ))}
          </div>
          <div className="pay-filter-row">
            <label className={filt.period === 'custom' ? 'on' : ''}><span>From</span><input type="date" name="from" defaultValue={filt.from} /></label>
            <label className={filt.period === 'custom' ? 'on' : ''}><span>To</span><input type="date" name="to" defaultValue={filt.to} /></label>
            <label><span>Orders</span>
              <select name="kind" defaultValue={filt.kind}>
                {Object.entries(KINDS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label className="pay-filter-q"><span>Search</span><input type="search" name="q" defaultValue={filt.q} placeholder="Name, email, phone, order #" /></label>
            <button className="btn btn-orange" type="submit">Apply</button>
            {filtered && <Link className="adm-link" href={hrefWith({ view }, {})}>Clear filters</Link>}
          </div>
          {filtered && (
            <p className="pay-muted pay-filter-note">
              Showing {orders.length} of {allOrders.length} order{allOrders.length === 1 ? '' : 's'}
              {filt.from ? ` · ${filt.from === filt.to ? filt.from : `${filt.from} → ${filt.to || 'today'}`}` : filt.to ? ` · up to ${filt.to}` : ''}
              {filt.kind !== 'all' ? ` · ${KINDS[filt.kind].toLowerCase()}` : ''}{filt.q ? ` · “${filt.q}”` : ''}. Totals below follow these filters.
            </p>
          )}
        </form>

        <div className="pay-stats">
          {stats.map(([k, v, s]) => <div key={k}><small>{k}</small><b>{v}</b><span>{s}</span></div>)}
        </div>

        <details className="pay-rules">
          <summary>How checkout calculates delivery, tax and fees</summary>
          <ul>
            <li><b>Free local delivery:</b> Reno &amp; Sparks ZIP codes. If we can&apos;t deliver (weather, emergency), the order ships under the normal terms.</li>
            <li><b>Shipping:</b> {fmt(CHECKOUT.shipping.flatCents)} flat rate under {fmt(CHECKOUT.shipping.freeOverCents)} · free on out-of-state orders of {fmt(CHECKOUT.shipping.freeOverCents)} and over (merchandise subtotal before tax; {CHECKOUT.shipping.noFreeStates.join(' & ')} excluded).</li>
            <li><b>Sales tax</b> on products only: {CHECKOUT.tax.zones.map(z => `${z.label} ${pct(z.rate)}`).join(' · ')} · other NV {pct(CHECKOUT.tax.nevadaDefault.rate)} · out of state 0%.</li>
            <li><b>Payment:</b> every online order is paid in full at checkout. Customers ordering {LARGE_ORDER}+ are asked to email {CHECKOUT.largeOrder.email} first (invoice those through Square).</li>
            <li><b>Square fee:</b> {pct(CHECKOUT.square.pct)} + {fmt(CHECKOUT.square.fixedCents)} on each card payment, paid by NeeksxArt.</li>
            <li className="pay-muted">All of these are set in <code>lib/checkout.js</code>. Confirm the tax rates before going live.</li>
          </ul>
        </details>

        <div className="adm-filters">
          <div className="adm-tabs">
            {Object.entries(VIEWS).map(([k, v]) => (
              <Link key={k} href={hrefWith(cur, { view: k })} className={k === view ? 'on' : ''}>
                {v.label} <span className="pay-n">{orders.filter(v.test).length}</span>
              </Link>
            ))}
          </div>
        </div>

        {!shown.length && (filtered
          ? <p className="adm-empty">No orders match these filters. <Link href={hrefWith({ view }, {})}>Clear filters</Link></p>
          : <p className="adm-empty">No orders here yet. Place a test order at <Link href="/catalog" target="_blank">the catalog</Link> → Add to cart → Checkout.</p>)}

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
                          <tr key={l.id}><td><b>{l.qty} ×</b> {l.name}<small>{l.tierNote}</small>
                            {l.tapUrl && <small className="pay-tap">Tap link: <a href={l.tapUrl} target="_blank" rel="noopener noreferrer">{l.tapUrl}</a></small>}
                          </td><td>{fmt(l.totalCents)}</td></tr>
                        ))}
                      </tbody>
                    </table>

                    {(o.items || []).some(l => l.photos?.length) && (
                      <>
                        <h4>Customer photos</h4>
                        {(o.items || []).filter(l => l.photos?.length).map(l => (
                          <div key={l.id} className="pay-photos">
                            <small>{l.qty} × {l.name}</small>
                            <div className="pay-photo-grid">
                              {l.photos.map((p, i) => (
                                <a key={p.path} href={downloadUrls[p.path] || viewUrls[p.path] || '#'} title={`Download photo ${i + 1}`}
                                  className={photoSpec(l.id)?.shape === 'round' ? 'round' : ''}>
                                  {viewUrls[p.path] ? <img src={viewUrls[p.path]} alt={`Photo ${i + 1}`} loading="lazy" /> : <span>Photo {i + 1}</span>}
                                  <b>× {p.count}</b>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    <h4>{METHOD[f.method] || 'Fulfillment'}</h4>
                    <p className="pay-ful"><b>{f.label}</b>
                      {f.address && <><br />{f.address.line1}{f.address.line2 ? `, ${f.address.line2}` : ''}<br />{f.address.city}, {f.address.state} {f.address.zip}</>}
                    </p>
                    <ul className="pay-explain">{(f.explain || []).map((e, i) => <li key={i}>{e}</li>)}</ul>

                    <h4>Customer</h4>
                    <p className="pay-ful"><a href={`mailto:${c.email}`}>{c.email}</a>{c.phone && <> · <a href={`tel:${c.phone}`}>{c.phone}</a></>}</p>
                    {c.consent && (
                      <p className={`pay-ful pay-consent${canPost(c.consent) ? ' ok' : ' no'}`}>
                        <b>{canPost(c.consent) ? 'OK to post on socials' : 'Do not post on socials'}</b>
                        <small>Asked to share: {c.consent.social ? 'Yes' : 'No'} · Child under 18 in photos: {c.consent.minor ? 'Yes' : 'No'}</small>
                      </p>
                    )}
                    {o.note && <p className="pay-ful"><b>Note:</b> {o.note}</p>}

                    <h4>Emails</h4>
                    {(o.emails || f.emails) ? (
                      <ul className="pay-mail">
                        {(m => [['To you', m.owner], [`To customer${m.customer?.to ? ` (${m.customer.to})` : ''}`, m.customer]])(o.emails || f.emails).map(([who, m]) => (
                          <li key={who} className={`pm-${m?.status || 'unknown'}`}>
                            <span>{who}</span>
                            <b>{MAIL[m?.status] || 'Unknown'}</b>
                            {m?.at && <small>{time(m.at)}</small>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="pay-ful pay-muted">Not recorded for this order.</p>
                    )}
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
                  {(o.items || []).some(l => l.photos?.length && photoSpec(l.id)?.sheet) && (
                    <a className="adm-print" href={`/api/admin/print-sheet?shop=${o.id}`} download>
                      <span>Download print sheet</span>
                      <small>PDF · {sheetPieces(o)} piece{sheetPieces(o) === 1 ? '' : 's'} placed on the template, exact size</small>
                    </a>
                  )}
                  {(o.items || []).some(l => l.photos?.length && !photoSpec(l.id)?.sheet) && (
                    <small className="pay-muted">No print template yet for {(o.items || []).filter(l => l.photos?.length && !photoSpec(l.id)?.sheet).map(l => l.name).join(', ')}. Download those photos above.</small>
                  )}
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
