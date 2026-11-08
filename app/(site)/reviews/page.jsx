import ReviewsSection from '@/components/reviews/ReviewsSection';
import ReviewForm from '@/components/reviews/ReviewForm';
import { PRODUCTS } from '@/lib/catalog';

export const metadata = {
  title: 'Reviews | NeeksxArt — Custom Merch in Reno, NV',
  description: 'What customers say about NeeksxArt custom magnets, keychains, mirrors and buttons. Leave a review of your order right here.',
  alternates: { canonical: '/reviews' }
};
export const revalidate = 600;

export default function ReviewsPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow">Reviews</span>
          <h1 className="display">Merch people <span className="script">talk about.</span></h1>
          <p className="lead">Read what customers say, or tell us how your order turned out. No Yelp account needed.</p>
        </div>
      </section>
      <ReviewsSection showWrite={false} />
      <section className="pad paper-2" id="write">
        <div className="wrap" style={{ maxWidth: '760px' }}>
          <span className="eyebrow">Leave a review</span>
          <h2 style={{ margin: '14px 0 24px' }}>How did <span className="script" style={{ textTransform: 'none' }}>we do?</span></h2>
          <ReviewForm products={PRODUCTS.map(p => p.name)} />
        </div>
      </section>
    </>
  );
}
