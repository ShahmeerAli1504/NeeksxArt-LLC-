import Link from 'next/link';
import { media } from '@/lib/media';
import Estimator from '@/components/catalog/Estimator';
import LiveCards from '@/components/catalog/LiveCards';
import PriceTables from '@/components/catalog/PriceTables';
import ShippingNote from '@/components/notes/ShippingNote';
import PrintAsIs from '@/components/notes/PrintAsIs';
import { pageMeta, webPage, breadcrumbs, productList } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata = pageMeta({
  title: "Estimate Pricing | NeeksxArt Custom Merch Price Sheet",
  description: "Estimate your NeeksxArt order: single prices and bundle packs for custom magnets, buttons, keychains, mirror keychains, Tap-to-Connect NFC keychains and pocket mirrors.",
  path: '/pricing'
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[webPage({ type: 'WebPage', name: metadata.title.absolute, description: metadata.description, path: '/pricing' }), breadcrumbs([['Pricing', '/pricing']]), productList(undefined, 'NeeksxArt custom merch price sheet')]} />
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Estimate pricing</span>
          <h1 className="display reveal d1">
            The more you make,{" "}
            <span className="script">the less each.</span>
          </h1>
          <p className="lead reveal d2">
            Pick a product, then a single quantity or a bundle pack. All prices are + tax; your exact total with tax shows at checkout once you enter your ZIP.
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
          <div className="notes-row" style={{ marginTop: "24px" }}>
            <PrintAsIs />
            <ShippingNote />
          </div>
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">Price sheet</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Every product,{" "}
                <span className="script" style={{ textTransform: "none" }}>every bundle</span>
              </h2>
            </div>
            <p className="lead reveal d2">
              Single prices, then bundle packs, all + tax and shipping. Online photo magnet packages and live pop-up packages are priced separately, and event bundles get a personalized quote.
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
                Preview your photo or logo in the Merch Studio, download it and order. Need a custom quantity, or help creating artwork? Email or DM us (creative assistance is $40–$60).
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
