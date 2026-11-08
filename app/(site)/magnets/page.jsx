import Link from 'next/link';
import { media } from '@/lib/media';
import ShopGrid from '@/components/catalog/ShopGrid';
import ShippingNote from '@/components/notes/ShippingNote';
import PrintAsIs from '@/components/notes/PrintAsIs';

// product photos can change from the dashboard; refreshed on upload and at least hourly
export const revalidate = 3600;

export const metadata = {
  title: "Standard Custom Magnets | NeeksxArt — Reno, NV",
  description: "Custom 2.5-inch square and 2.25-inch circular photo and logo magnets by NeeksxArt in Reno, NV. No minimums, free digital mockups, tiered pricing.",
  openGraph: { title: "Standard Custom Magnets | NeeksxArt — Reno, NV", description: "Custom 2.5-inch square and 2.25-inch circular photo and logo magnets by NeeksxArt in Reno, NV. No minimums, free digital mockups, tiered pricing.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/magnets' },
};

export default function MagnetsPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Standard custom magnets</span>
          <h1 className="display reveal d1">
            Your photos.{" "}
            <span className="script">On the fridge.</span>
          </h1>
          <p className="lead reveal d2">
            Square and circular custom magnets for logos, photos, artwork and party favors. Order one or hundreds, with a free digital mockup before we print.
          </p>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="note-band reveal">
            <strong>Standard custom pricing</strong>
            <p>
              These prices are for custom orders. Live event magnets are priced separately on our{" "}
              <Link href="/events">NeeksxArt Live</Link>
              {" "}page.
            </p>
          </div>
          <div className="notes-row">
            <PrintAsIs />
            <ShippingNote />
          </div>
          <ShopGrid filter="magnets" className="shop-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }} />
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <span className="eyebrow reveal">How it works</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 40px" }}>
            Three steps to{" "}
            <span className="script" style={{ textTransform: "none" }}>your magnets</span>
          </h2>
          <div className="steps steps-3 light-steps reveal d2">
            <div className="step">
              <h3>Send your idea</h3>
              <p>Email your photos, logo or artwork and tell us what you want made.</p>
            </div>
            <div className="step">
              <h3>Free mockup</h3>
              <p>We design a free digital mockup so you see it before anything prints.</p>
            </div>
            <div className="step">
              <h3>We make it</h3>
              <p>Once you approve it, we press every piece by hand in Reno.</p>
            </div>
          </div>
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
