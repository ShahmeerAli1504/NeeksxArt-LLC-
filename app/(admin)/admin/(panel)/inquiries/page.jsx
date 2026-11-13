import { Fragment } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, signedUrls, BUCKETS } from '@/lib/supabase/admin';
import { setInquiryStatus } from '@/lib/admin-actions';
import FilterBar from '@/components/admin/FilterBar';
import { readFilters, inRange, textMatch, dbBounds, hrefWith, filterNote } from '@/lib/admin-filters';

export const dynamic = 'force-dynamic';
const BASE = '/admin/inquiries';

const STATUSES = { new: 'New', replied: 'Replied', won: 'Won', archived: 'Archived' };
const time = d => new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default async function InquiriesPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES[sp?.status] ? sp.status : '';
  const filt = readFilters(sp);
  const topic = String(sp?.topic || '').slice(0, 80);
  const filtered = filt.period !== 'all' || !!filt.q || !!topic;
  const sb = supabaseAdmin();

  let fetched = [];
  if (sb) {
    let q = sb.from('inquiries').select('*').order('created_at', { ascending: false }).limit(filtered ? 1000 : 200);
    q = status ? q.eq('status', status) : q.neq('status', 'archived');
    const bounds = dbBounds(filt);
    if (bounds.gte) q = q.gte('created_at', bounds.gte);
    if (bounds.lte) q = q.lte('created_at', bounds.lte);
    const { data, error } = await q;
    if (error) console.error(error);
    fetched = data || [];
  }
  const topics = Object.fromEntries([['', 'All types'], ...[...new Set(fetched.map(r => r.topic).filter(Boolean)), ...(topic ? [topic] : [])].sort().map(t => [t, t])]);
  const rows = fetched.filter(r => inRange(r.created_at, filt) && (!topic || r.topic === topic) &&
    textMatch(filt.q, [r.name, r.business, r.email, r.topic, r.product, r.quantity, r.deadline, r.ship_to, r.message], [r.phone]));
  const cur = { status, topic, ...filt };
  const clearHref = hrefWith(BASE, { status }, {});
  const urls = await signedUrls(BUCKETS.uploads, rows.flatMap(r => [r.mockup_path, r.logo_path]), 60 * 60);

  return (
    <>
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Inquiries</h1>
            <p>Contact form, bulk orders, event quotes and Merch Studio mockups.</p>
          </div>
        </div>
        <FilterBar
          action={BASE} hidden={{ status }} filt={filt}
          periodHref={k => hrefWith(BASE, cur, { period: k })}
          selects={[{ name: 'topic', label: 'Type', value: topic, options: topics }]}
          placeholder="Name, business, email, phone, message"
          clearHref={clearHref} active={filtered}
          note={filterNote(filt, rows.length, fetched.length, 'inquir' + (fetched.length === 1 ? 'y' : 'ie'), [topic])}
        />
        <div className="adm-filters">
          <div className="adm-tabs">
            <Link href={hrefWith(BASE, cur, { status: '' })} className={!status ? 'on' : ''}>Open</Link>
            {Object.entries(STATUSES).map(([k, v]) => (
              <Link key={k} href={hrefWith(BASE, cur, { status: k })} className={k === status ? 'on' : ''}>{v}</Link>
            ))}
          </div>
        </div>
        {!sb && <p className="adm-empty">Supabase isn&apos;t connected yet. Add the keys from README → Supabase setup.</p>}
        {sb && !rows.length && (filtered
          ? <p className="adm-empty">No inquiries match these filters. <Link href={clearHref}>Clear filters</Link></p>
          : <p className="adm-empty">Nothing here yet.</p>)}
        <div className="adm-inq">
          {rows.map(r => (
            <article key={r.id} className={`adm-card ist-${r.status}`}>
              <div className="adm-order-head">
                <div>
                  <div className="adm-who"><b>{r.name}</b>{r.business ? ` · ${r.business}` : ''}</div>
                  <small>{r.topic} · {time(r.created_at)}</small>
                </div>
                <span className="adm-pill">{STATUSES[r.status] || r.status}</span>
              </div>
              <dl>
                <dt>Email</dt><dd><a href={`mailto:${r.email}?subject=${encodeURIComponent('Re: your NeeksxArt inquiry')}`}>{r.email}</a></dd>
                {r.phone && (<><dt>Phone</dt><dd><a href={`tel:${r.phone}`}>{r.phone}</a></dd></>)}
                {r.product && (<><dt>Product</dt><dd>{r.product}</dd></>)}
                {r.quantity && (<><dt>Quantity</dt><dd>{r.quantity}</dd></>)}
                {r.deadline && (<><dt>Need by</dt><dd>{r.deadline}</dd></>)}
                {r.ship_to && (<><dt>Ship to</dt><dd>{r.ship_to}</dd></>)}
              </dl>
              <p className="adm-msg">{r.message}</p>
              {Array.isArray(r.studio) && r.studio.length > 0 && (
                <details className="adm-studio">
                  <summary>Merch Studio build</summary>
                  <dl>{r.studio.map(([k, v], i) => (<Fragment key={i}><dt>{k}</dt><dd>{v}</dd></Fragment>))}</dl>
                </details>
              )}
              {(urls[r.mockup_path] || urls[r.logo_path]) && (
                <div className="adm-files">
                  {urls[r.mockup_path] && <a href={urls[r.mockup_path]} target="_blank" rel="noopener"><img src={urls[r.mockup_path]} alt="Mockup" /><span>Mockup</span></a>}
                  {urls[r.logo_path] && <a href={urls[r.logo_path]} target="_blank" rel="noopener"><img src={urls[r.logo_path]} alt="Logo" /><span>Logo</span></a>}
                </div>
              )}
              {r.logo_path && (
                <div className="adm-print-row">
                  <a className="adm-print" href={`/api/admin/print-sheet?inquiry=${r.id}&kind=round`} download>
                    <span>Logo on keychain sheet</span><small>PDF · 12 × 2.25&quot; round</small>
                  </a>
                  <a className="adm-print" href={`/api/admin/print-sheet?inquiry=${r.id}&kind=magnet`} download>
                    <span>Logo on magnet sheet</span><small>PDF · 6 × 2.5&quot; square</small>
                  </a>
                  <a className="adm-print" href={`/api/admin/print-sheet?inquiry=${r.id}&kind=round15`} download>
                    <span>Logo on 1.5&quot; keychain sheet</span><small>PDF · 15 × 1.5&quot; round</small>
                  </a>
                  <a className="adm-print" href={`/api/admin/print-sheet?inquiry=${r.id}&kind=round1`} download>
                    <span>Logo on 1&quot; button sheet</span><small>PDF · 35 × 1&quot; round</small>
                  </a>
                </div>
              )}
              <div className="adm-actions">
                {Object.entries(STATUSES).filter(([k]) => k !== r.status).map(([k, v]) => (
                  <form key={k} action={setInquiryStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={k} />
                    <button className="adm-link" type="submit">Mark {v.toLowerCase()}</button>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
