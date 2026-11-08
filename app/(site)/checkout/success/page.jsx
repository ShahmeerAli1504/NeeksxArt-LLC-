import Receipt from '@/components/shop/Receipt';

export const metadata = { title: 'Order confirmed | NeeksxArt', robots: { index: false } };

export default function SuccessPage() {
  return (
    <>
      <section className="page-hero dark grain co-hero">
        <div className="wrap">
          <span className="eyebrow">Payment received</span>
          <h1 className="display">Thank <span className="script">you!</span></h1>
        </div>
      </section>
      <section className="pad co-section">
        <div className="wrap"><Receipt /></div>
      </section>
    </>
  );
}
