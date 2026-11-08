import Link from 'next/link';
import { getReviews } from '@/lib/reviews';
import YelpEmbeds from './YelpEmbeds';

const Stars = ({ n }) => <span className="rv-stars" aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}<i>{'★'.repeat(5 - n)}</i></span>;
const date = d => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

/** Approved website reviews + Yelp reviews. `limit` trims the website reviews (homepage). */
export default async function ReviewsSection({ limit, showWrite = true, className = 'pad' }) {
  const r = await getReviews();
  const site = limit ? r.site.slice(0, limit) : r.site;
  const yelp = limit ? r.yelp.slice(0, 3) : r.yelp;
  return (
    <section className={`${className} rv-section`} id="reviews">
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: '28px' }}>
          <div>
            <span className="eyebrow">Reviews</span>
            <h2 style={{ marginTop: '14px' }}>Kind words <span className="script" style={{ textTransform: 'none' }}>from customers</span></h2>
          </div>
          <div className="rv-summary">
            {r.count > 0 && <p><b>{r.average.toFixed(1)}</b> <Stars n={Math.round(r.average)} /> <span>{r.count} review{r.count > 1 ? 's' : ''} on our site</span></p>}
            <div className="rv-ctas">
              {showWrite && <Link className="btn btn-orange" href="/reviews#write">Leave a review</Link>}
              {r.yelpUrl && <a className="btn btn-ghost" href={r.yelpUrl} target="_blank" rel="noopener"><span>See us on Yelp</span></a>}
            </div>
          </div>
        </div>
        {site.length === 0 && yelp.length === 0 && <p className="rv-empty">Be the first to review your order.</p>}
        {site.length > 0 && (
          <div className="rv-grid">
            {site.map(x => (
              <article className="rv-card" key={x.id}>
                <Stars n={x.rating} />
                <p>{x.body}</p>
                <footer><b>{x.name}</b>{x.product && <span>{x.product}</span>}<time>{date(x.created_at)}</time></footer>
              </article>
            ))}
          </div>
        )}
        <YelpEmbeds reviews={yelp} />
        {limit && r.site.length > limit && <p style={{ marginTop: '18px' }}><Link className="link-arrow" href="/reviews">Read all reviews →</Link></p>}
      </div>
    </section>
  );
}
