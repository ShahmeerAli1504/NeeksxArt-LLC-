import Checkout from '@/components/shop/Checkout';

export const metadata = {
  title: 'Checkout | NeeksxArt',
  description: 'Review your NeeksxArt order, choose pickup, local delivery or shipping, and pay securely.',
  robots: { index: false }
};

export default function CheckoutPage() {
  return (
    <>
      <section className="page-hero dark grain co-hero">
        <div className="wrap">
          <span className="eyebrow">Checkout</span>
          <h1 className="display">Almost <span className="script">yours.</span></h1>
        </div>
      </section>
      <section className="pad co-section">
        <div className="wrap"><Checkout /></div>
      </section>
    </>
  );
}
