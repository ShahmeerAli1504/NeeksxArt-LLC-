'use client';
// Yelp reviews in Yelp's own embed format (from a review's "Embed review" button on yelp.com).
// We rebuild the snippet from the stored review id + links, then load Yelp's widget script.
import { useEffect, useRef } from 'react';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default function YelpEmbeds({ reviews = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!reviews.length) return;
    document.querySelectorAll('script[data-yelp-widget]').forEach(s => s.remove());
    const s = document.createElement('script');
    s.src = 'https://www.yelp.com/embed/widgets.js'; s.async = true; s.dataset.yelpWidget = '1';
    document.body.appendChild(s);
  }, [reviews]);
  if (!reviews.length) return null;
  return (
    <div className="rv-yelp" ref={ref}>
      {reviews.map(r => (
        <div className="rv-yelp-item" key={r.id} dangerouslySetInnerHTML={{ __html:
          `<span class="yelp-review" data-review-id="${esc(r.yelp_review_id)}" data-hostname="www.yelp.com">Read <b>${esc(r.name)}</b>'s ` +
          `<a href="${esc(r.yelp_url || r.yelp_biz_url || 'https://www.yelp.com')}" rel="nofollow noopener" target="_blank">review</a> of ` +
          `<a href="${esc(r.yelp_biz_url || 'https://www.yelp.com')}" rel="nofollow noopener" target="_blank">NeeksxArt</a> on ` +
          `<a href="https://www.yelp.com" rel="nofollow noopener" target="_blank">Yelp</a></span>` }} />
      ))}
    </div>
  );
}
