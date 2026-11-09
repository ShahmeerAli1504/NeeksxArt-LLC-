import Link from 'next/link';
import { media } from '@/lib/media';
import ShopGrid from '@/components/catalog/ShopGrid';
import ShippingNote from '@/components/notes/ShippingNote';
import PrintAsIs from '@/components/notes/PrintAsIs';

// product photos can change from the dashboard; refreshed on upload and at least hourly
export const revalidate = 3600;

export const metadata = {
  title: "Catalog | NeeksxArt — Custom Magnets, Keychains, Mirrors & Buttons",
  description: "The full NeeksxArt catalog: custom magnets, pin buttons, keychains, mirror keychains, Tap-to-Connect NFC keychains and pocket mirrors. Buttons from $1.50, keychains from $4.00, magnets from $5.00.",
  openGraph: { title: "Catalog | NeeksxArt — Custom Magnets, Keychains, Mirrors & Buttons", description: "The full NeeksxArt catalog: custom magnets, pin buttons, keychains, mirror keychains, Tap-to-Connect NFC keychains and pocket mirrors. Buttons from $1.50, keychains from $4.00, magnets from $5.00.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/catalog' },
};

export default function CatalogPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">The full catalog</span>
          <h1 className="display reveal d1">
            Made custom.{" "}
            <span className="script">Made personal.</span>
          </h1>
          <p className="lead reveal d2">
            Custom photo magnets, keychains, pocket mirrors, buttons and personalized gifts. Every piece is designed with you and pressed by hand in Reno.
          </p>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="chip-nav reveal">
            <a href="#standard">Order anytime</a>
            <a href="#special">Special orders</a>
            <Link href="/pricing">Price sheet</Link>
          </div>
          <div className="sec-head" id="standard" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">No minimums</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Order{" "}
                <span className="script" style={{ textTransform: "none" }}>anytime</span>
              </h2>
            </div>
            <p className="lead reveal d2">
              Design yours in the Merch Studio or email your idea. All prices are + tax and shipping.
            </p>
          </div>
          <div className="notes-row">
            <PrintAsIs />
            <ShippingNote />
          </div>
          <ShopGrid filter="standard" className="shop-grid" />
        </div>
      </section>
      <section className="pad paper-2" id="special">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">Email inquiry required</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Special{" "}
                <span className="script" style={{ textTransform: "none" }}>orders</span>
              </h2>
            </div>
            <p className="lead reveal d2">
              Custom mirror keychains, Tap-to-Connect keychains and pocket mirrors need a quick design consultation before purchase. Email{" "}
              <a href="mailto:info@neeksxart.com" style={{ color: "var(--accent-text)", fontWeight: 800 }}>info@neeksxart.com</a>
              {" "}to start.
            </p>
          </div>
          <ShopGrid filter="special" className="shop-grid" />
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
