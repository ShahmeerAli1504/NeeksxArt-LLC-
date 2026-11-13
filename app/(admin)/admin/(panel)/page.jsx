import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, signedUrls, BUCKETS } from '@/lib/supabase/admin';
import { setOrderStatus } from '@/lib/admin-actions';
import { STATUS_LABEL } from '@/lib/bundles';
import { pieceKind } from '@/lib/print-sheet-core';
import AutoRefresh from '@/components/admin/AutoRefresh';
import PopupControl from '@/components/admin/PopupControl';
import FilterBar from '@/components/admin/FilterBar';
import { readFilters, inRange, textMatch, dbBounds, hrefWith, filterNote } from '@/lib/admin-filters';

export const dynamic = 'force-dynamic';

const VIEWS = {
  active: ['new', 'printing', 'ready'],
  done: ['picked_up'],
  cancelled: ['cancelled'],
  all: ['new', 'printing', 'ready', 'picked_up', 'cancelled']
};
const NEXT_STEP = { new: 'printing', printing: 'ready', ready: 'picked_up' };
const time = d => d ? new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : '';

export default async function OrdersPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const view = VIEWS[sp?.view] ? sp.view : 'active';
  const event = sp?.event || '';
  const filt = readFilters(sp);
  const filtered = filt.period !== 'all' || !!filt.q;
  const sb = supabaseAdmin();

  if (!sb) {
    return (
      <>
        <div className="adm-wrap"><p className="adm-empty">Supabase isn&apos;t connected yet. Add the keys from README → Supabase setup.</p></div>
      </>
    );
  }

  let q = sb.from('event_orders').select('*').in('status', VIEWS[view]).order('submitted_at', { ascending: view !== 'active' ? false : true }).limit(filtered ? 1000 : 200);
  if (event) q = q.eq('event_slug', event);
  const bounds = dbBounds(filt);
  if (bounds.gte) q = q.gte('submitted_at', bounds.gte);
  if (bounds.lte) q = q.lte('submitted_at', bounds.lte);
  const [{ data: fetched = [], error }, { data: recent = [] }] = await Promise.all([
    q,
    sb.from('event_orders').select('event_slug, event_name, status').neq('status', 'uploading').order('created_at', { ascending: false }).limit(1000)
  ]);
  if (error) console.error(error);
  const orders = (fetched || []).filter(o => inRange(o.submitted_at, filt) &&
    textMatch(filt.q, [o.order_id, o.name, o.email, o.bundle, o.note, o.event_name, o.event_slug, o.price], [o.phone]));

  const events = [];
  const counts = { new: 0, printing: 0, ready: 0 };
  (recent || []).forEach(r => {
    if (!events.find(e => e.slug === r.event_slug)) events.push({ slug: r.event_slug, name: r.event_name || r.event_slug });
    if ((!event || r.event_slug === event) && counts[r.status] !== undefined) counts[r.status]++;
  });

  const urls = await signedUrls(BUCKETS.events, (orders || []).flatMap(o => [o.sheet_path, ...(o.photo_paths || [])]));
  const cur = { event, view: view !== 'active' ? view : '', ...filt };
  const link = patch => hrefWith('/admin', cur, patch, { view: 'active' });

  return (
    <>
      {view === 'active' && <AutoRefresh seconds={15} />}
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Pop-up orders</h1>
            <p>{view === 'active' ? 'Oldest first, so the queue matches the press. Refreshes every 15 seconds.' : 'Newest first.'}</p>
          </div>
          <div className="adm-counts">
            <span className="st-new"><b>{counts.new}</b> received</span>
            <span className="st-printing"><b>{counts.printing}</b> pressing</span>
            <span className="st-ready"><b>{counts.ready}</b> ready</span>
          </div>
        </div>

        <PopupControl />

        <FilterBar
          action="/admin" hidden={{ view: cur.view, event }} filt={filt}
          periodHref={k => link({ period: k })}
          placeholder="Order #, name, phone, email, bundle"
          clearHref={hrefWith('/admin', { event, view: cur.view }, {}, { view: 'active' })} active={filtered}
          note={filterNote(filt, orders.length, (fetched || []).length, 'order', [{ active: 'in progress', done: 'picked up', cancelled: 'cancelled', all: '' }[view]])}
        />

        <div className="adm-filters">
          <div className="adm-tabs">
            {Object.keys(VIEWS).map(v => (
              <Link key={v} href={link({ view: v === 'active' ? '' : v })} className={v === view ? 'on' : ''}>
                {{ active: 'In progress', done: 'Picked up', cancelled: 'Cancelled', all: 'All' }[v]}
              </Link>
            ))}
          </div>
          <div className="adm-tabs">
            <Link href={link({ event: '' })} className={!event ? 'on' : ''}>All events</Link>
            {events.map(e => (
              <Link key={e.slug} href={link({ event: e.slug })} className={e.slug === event ? 'on' : ''}>{e.name}</Link>
            ))}
          </div>
        </div>

        {!orders.length && (filtered
          ? <p className="adm-empty">No orders match these filters. <Link href={hrefWith('/admin', { event, view: cur.view }, {}, { view: 'active' })}>Clear filters</Link></p>
          : <p className="adm-empty">No orders here yet.</p>)}

        <div className="adm-orders">
          {(orders || []).map(o => (
            <article key={o.id} className={`adm-order st-${o.status}`}>
              <div className="adm-order-head">
                <div>
                  <div className="adm-num">{o.order_id}</div>
                  <div className="adm-who">{o.name} · {o.bundle}</div>
                </div>
                <span className="adm-pill">{STATUS_LABEL[o.status] || o.status}</span>
              </div>
              {o.sheet_path && urls[o.sheet_path] && (
                <a href={urls[o.sheet_path]} target="_blank" rel="noopener" className="adm-sheet"><img src={urls[o.sheet_path]} alt={`Overview of ${o.order_id}`} /></a>
              )}
              <dl>
                <dt>Event</dt><dd>{o.event_name || o.event_slug}</dd>
                <dt>Placed</dt><dd>{time(o.submitted_at)}</dd>
                {o.price && (<><dt>Price</dt><dd>{o.price}</dd></>)}
                {o.phone && (<><dt>Phone</dt><dd><a href={`tel:${o.phone}`}>{o.phone}</a></dd></>)}
                {o.email && (<><dt>Email</dt><dd><a href={`mailto:${o.email}`}>{o.email}</a></dd></>)}
                {o.note && (<><dt>Note</dt><dd>{o.note}</dd></>)}
              </dl>
              <div className="adm-files">
                {(o.photo_paths || []).map((p, i) => urls[p] && (
                  <a key={p} href={urls[p]} target="_blank" rel="noopener" download={`${o.order_id}-${String(i + 1).padStart(2, '0')}.jpg`} title={`Print file #${i + 1} (${(o.items || [])[i] || 'photo'})`}>
                    <img src={urls[p]} alt="" loading="lazy" /><span>#{i + 1}</span>
                  </a>
                ))}
              </div>
              {(n => n > 0 && (
                <a className="adm-print" href={`/api/admin/print-sheet?order=${o.id}`} download>
                  <span>Download print sheet</span>
                  <small>PDF · {n} photo{n === 1 ? '' : 's'} placed on the template, exact size</small>
                </a>
              ))((o.photo_paths || []).filter((_, i) => pieceKind((o.items || [])[i], o.shape)).length)}
              {(o.photo_paths || []).some((_, i) => !pieceKind((o.items || [])[i], o.shape)) && (
                <small className="pay-muted">Some photos have no print template for their size. Download those photos above.</small>
              )}
              <div className="adm-actions">
                {NEXT_STEP[o.status] && (
                  <form action={setOrderStatus}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="status" value={NEXT_STEP[o.status]} />
                    <button className="btn btn-orange" type="submit">Mark {STATUS_LABEL[NEXT_STEP[o.status]].toLowerCase()}</button>
                  </form>
                )}
                {o.status !== 'cancelled' && o.status !== 'picked_up' && (
                  <form action={setOrderStatus}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button className="adm-link" type="submit">Cancel</button>
                  </form>
                )}
                {(o.status === 'cancelled' || o.status === 'picked_up') && (
                  <form action={setOrderStatus}>
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="status" value="new" />
                    <button className="adm-link" type="submit">Reopen</button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
