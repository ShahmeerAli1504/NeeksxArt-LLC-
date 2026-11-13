import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { setReviewStatus, deleteReview, addYelpReview } from '@/lib/review-actions';
import AdminNav from '@/components/admin/AdminNav';
import FilterBar from '@/components/admin/FilterBar';
import { readFilters, inRange, textMatch, hrefWith, filterNote } from '@/lib/admin-filters';

export const dynamic = 'force-dynamic';
const BASE = '/admin/reviews';
const STATUS_OPTS = { '': 'Any status', pending: 'Waiting for approval', approved: 'Showing', hidden: 'Hidden' };
const STAR_OPTS = { '': 'Any rating', 5: '★★★★★ 5', 4: '★★★★ 4', 3: '★★★ 3', 2: '★★ 2', 1: '★ 1' };
const date = d => new Date(d).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const LABEL = { pending: 'Waiting for approval', approved: 'Showing on the site', hidden: 'Hidden' };

function Btn({ id, status, children, cls = 'adm-link' }) {
  return <form action={setReviewStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className={cls} type="submit">{children}</button></form>;
}

export default async function ReviewsAdmin({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const sb = supabaseAdmin();
  let rows = [], err = '';
  if (sb) {
    const { data, error } = await sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(300);
    if (error) err = error.message; else rows = data || [];
  }
  const order = { pending: 0, approved: 1, hidden: 2 };
  const allSite = rows.filter(r => r.source === 'site').sort((a, b) => order[a.status] - order[b.status]);
  const allYelp = rows.filter(r => r.source === 'yelp');
  const pending = allSite.filter(r => r.status === 'pending').length;

  const filt = readFilters(sp);
  const status = STATUS_OPTS[sp?.status] && sp.status ? sp.status : '';
  const stars = STAR_OPTS[sp?.stars] && sp.stars ? sp.stars : '';
  const filtered = filt.period !== 'all' || !!filt.q || !!status || !!stars;
  const cur = { status, stars, ...filt };
  const clearHref = BASE;
  const site = allSite.filter(r => inRange(r.created_at, filt) && (!status || r.status === status) && (!stars || r.rating === Number(stars)) &&
    textMatch(filt.q, [r.name, r.body, r.product]));
  // Yelp embeds have no rating stored; status/date/search still apply
  const yelp = allYelp.filter(r => inRange(r.created_at, filt) && !stars && (!status || r.status === status) && textMatch(filt.q, [r.name, r.yelp_url]));

  return (
    <>
      <AdminNav active="reviews" />
      <div className="adm-wrap">
        <div className="adm-head">
          <div>
            <h1>Reviews</h1>
            <p>Website reviews only show after you approve them. Yelp reviews show in Yelp&apos;s own format. <Link href="/reviews" target="_blank" style={{ color: 'var(--orange)' }}>View reviews page ↗</Link></p>
          </div>
          <div className="adm-counts"><span className="st-new"><b>{pending}</b> to approve</span><span><b>{allSite.filter(r => r.status === 'approved').length}</b> showing</span><span><b>{allYelp.length}</b> from Yelp</span></div>
        </div>
        {!sb && <p className="pay-warn">Supabase isn&apos;t connected yet.</p>}
        {err && <p className="pay-warn">Run supabase/updates-nov-2026.sql in Supabase to turn on reviews. ({err})</p>}

        <FilterBar
          action={BASE} filt={filt}
          periodHref={k => hrefWith(BASE, cur, { period: k })}
          selects={[
            { name: 'status', label: 'Status', value: status, options: STATUS_OPTS },
            { name: 'stars', label: 'Stars', value: stars, options: STAR_OPTS }
          ]}
          placeholder="Name, review text, product"
          clearHref={clearHref} active={filtered}
          note={filterNote(filt, site.length + yelp.length, rows.length, 'review', [status && STATUS_OPTS[status].toLowerCase(), stars && `${stars} stars`])}
        />

        <h2 className="adm-sub">Website reviews</h2>
        {!site.length && (filtered
          ? <p className="adm-empty">No website reviews match these filters. <Link href={clearHref}>Clear filters</Link></p>
          : <p className="adm-empty">No reviews yet. Share neeksxart.com/reviews with customers after their order.</p>)}
        <div className="rv-admin">
          {site.map(r => (
            <article key={r.id} className={`rv-admin-card rs-${r.status}`}>
              <header><b>{'★'.repeat(r.rating)}<i>{'★'.repeat(5 - r.rating)}</i></b><span className="adm-pill">{LABEL[r.status]}</span></header>
              <p>{r.body}</p>
              <small>{r.name}{r.product ? ` · ${r.product}` : ''} · {date(r.created_at)}</small>
              <div className="adm-actions">
                {r.status !== 'approved' && <Btn id={r.id} status="approved" cls="btn btn-orange">Approve</Btn>}
                {r.status !== 'hidden' && <Btn id={r.id} status="hidden">Hide</Btn>}
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="adm-link" type="submit">Delete</button></form>
              </div>
            </article>
          ))}
        </div>

        <h2 className="adm-sub">Yelp reviews</h2>
        <form action={addYelpReview} className="rv-yelp-add">
          <p>On <b>yelp.com</b>, open your business page, hover over a review, click <b>Embed review</b>, copy the code and paste it here.</p>
          {sp?.yelp === 'bad' && <p className="pay-warn">That doesn&apos;t look like Yelp embed code. Copy the whole snippet from &quot;Embed review&quot;.</p>}
          {sp?.yelp === 'added' && <p className="rv-ok">Yelp review added. It&apos;s on the site now.</p>}
          <textarea name="code" required rows={4} placeholder={'<span class="yelp-review" data-review-id="…" …>'} />
          <button className="btn btn-orange" type="submit">Add Yelp review</button>
        </form>
        <div className="rv-admin">
          {yelp.map(r => (
            <article key={r.id} className="rv-admin-card rs-approved">
              <header><b>Yelp · {r.name}</b><span className="adm-pill">{r.status === 'approved' ? 'Showing' : 'Hidden'}</span></header>
              <small><a href={r.yelp_url || r.yelp_biz_url || '#'} target="_blank" rel="noopener">Open on Yelp ↗</a> · added {date(r.created_at)}</small>
              <div className="adm-actions">
                {r.status === 'approved' ? <Btn id={r.id} status="hidden">Hide</Btn> : <Btn id={r.id} status="approved" cls="btn btn-orange">Show</Btn>}
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="adm-link" type="submit">Remove</button></form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
