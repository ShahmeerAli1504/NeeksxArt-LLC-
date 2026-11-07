import Link from 'next/link';
import { media } from '@/lib/media';
import Estimator from '@/components/catalog/Estimator';
import LiveCards from '@/components/catalog/LiveCards';
import PriceTables from '@/components/catalog/PriceTables';

export const metadata = {
  title: "Estimate Pricing | NeeksxArt Custom Merch Price Sheet",
  description: "Estimate your NeeksxArt order: tiered pricing for custom magnets, buttons, keychains, mirror keychains, Tap-to-Connect NFC keychains and pocket mirrors.",
  openGraph: { title: "Estimate Pricing | NeeksxArt Custom Merch Price Sheet", description: "Estimate your NeeksxArt order: tiered pricing for custom magnets, buttons, keychains, mirror keychains, Tap-to-Connect NFC keychains and pocket mirrors.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Estimate pricing</span>
          <h1 className="display reveal d1">
            The more you make,{" "}
            <span className="script">the less each.</span>
          </h1>
          <p className="lead reveal d2">
            Pick a product and quantity to see your estimated subtotal. Every product has tiered pricing, and you never pay more than the next tier would cost.
          </p>
        </div>
      </section>
      <section className="pad" id="estimate">
        <div className="wrap">
          <span className="eyebrow reveal">Instant estimate</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 34px" }}>
            Build your{" "}
            <span className="script" style={{ textTransform: "none" }}>estimate</span>
          </h2>
          <Estimator className="reveal d2" />
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">Price sheet</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Every product,{" "}
                <span className="script" style={{ textTransform: "none" }}>every tier</span>
              </h2>
            </div>
            <p className="lead reveal d2">
              Per-item prices before applicable tax and shipping. Online photo magnet packages and live pop-up packages are priced separately, and event bundles get a personalized quote.
            </p>
          </div>
          <PriceTables className="price-groups" />
        </div>
      </section>
      <section className="pad dark-2">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">At the booth</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                NeeksxArt Live{" "}
                <span className="script" style={{ textTransform: "none" }}>bundles</span>
              </h2>
            </div>
            <Link href="/events" className="link-arrow reveal d2">
              How pop-ups work{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <LiveCards className="live-cards" />
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>
                Got an idea?{" "}
                <span className="script" style={{ textTransform: "none" }}>Let's make it.</span>
              </h2>
              <p>
                Email us your photos, logo or artwork. We'll send a free digital mockup, and production starts only after you approve it.
              </p>
            </div>
            <div className="ctas">
              <a href="mailto:info@neeksxart.com?subject=Custom%20order%20inquiry" className="btn btn-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
                {" "}info@neeksxart.com
              </a>
              {" "}
              <Link href="/studio" className="btn btn-ghost" style={{ color: "#fff" }}>
                <span>Preview in the Merch Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
