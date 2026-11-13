import { Fragment } from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, signedUrls, BUCKETS } from '@/lib/supabase/admin';
import { setInquiryStatus } from '@/lib/admin-actions';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

const STATUSES = { new: 'New', replied: 'Replied', won: 'Won', archived: 'Archived' };
const time = d => new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default async function InquiriesPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES[sp?.status] ? sp.status : '';
  const sb = supabaseAdmin();

  let rows = [];
  if (sb) {
    let q = sb.from('inquiries').select('*').order('created_at', { ascending: false }).limit(200);
    q = status ? q.eq('status', status) : q.neq('status', 'archived');
    const { data, error } = await q;
    if (error) console.error(error);
    rows = data || [];
  }
  const urls = await signedUrls(BUCKETS.uploads, rows.flatMap(r => [r.mockup_path, r.logo_path]), 60 * 60);

  return (
    <>
      <AdminNav active="inquiries" />
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Inquiries</h1>
            <p>Contact form, bulk orders, event quotes and Merch Studio mockups.</p>
          </div>
        </div>
        <div className="adm-filters">
          <div className="adm-tabs">
            <Link href="/admin/inquiries" className={!status ? 'on' : ''}>Open</Link>
            {Object.entries(STATUSES).map(([k, v]) => (
              <Link key={k} href={`/admin/inquiries?status=${k}`} className={k === status ? 'on' : ''}>{v}</Link>
            ))}
          </div>
        </div>
        {!sb && <p className="adm-empty">Supabase isn&apos;t connected yet. Add the keys from README → Supabase setup.</p>}
        {sb && !rows.length && <p className="adm-empty">Nothing here yet.</p>}
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
