import Link from 'next/link';
import { media } from '@/lib/media';
import { BundleCards } from '@/components/popup/BundleCards';
import TryQr from '@/components/popup/TryQr';
import LiveOrderLink, { LiveOnly } from '@/components/popup/LiveOrderLink';
import { pageMeta, webPage, breadcrumbs, service } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

// the live-order button and QR only show while Live ordering is switched on in the dashboard
export const revalidate = 300;

export const metadata = pageMeta({
  title: "Live Pop-Ups | Custom Photo Magnets Made On-Site — NeeksxArt",
  description: "NeeksxArt Live: scan a QR code at our pop-up, upload your photos and pick up custom magnets and keychains in 10–15 minutes. Book us for your event.",
  path: '/events'
});

export default function EventsPage() {
  return (
    <>
      <JsonLd data={[webPage({ type: 'WebPage', name: metadata.title.absolute, description: metadata.description, path: '/events' }), breadcrumbs([['Live Pop-Ups', '/events']]), service({ name: 'NeeksxArt Live pop-up: custom photo magnets and keychains made on-site', description: metadata.description, path: '/events', serviceType: 'Event photo magnet and keychain pop-up' })]} />
      <section className="page-hero dark grain">
        <div className="wrap pop-hero">
          <div>
            <span className="eyebrow reveal">NeeksxArt Live</span>
            <h1 className="display reveal d1">
              Made on the spot.{" "}
              <span className="script">in minutes.</span>
            </h1>
            <p className="lead reveal d2">
              Catch us at a pop-up: scan the QR code, pick a bundle pack, upload photos straight from your camera roll, and walk away with custom magnets and keychains in 10–15 minutes.
            </p>
            <div className="hero-ctas reveal d3">
              <LiveOrderLink className="btn btn-orange">
                {p => (<>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4M7 9l5-5 5 5"></path>
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                  </svg>
                  {" "}Live now at {p.name}: order here
                </>)}
              </LiveOrderLink>
              {" "}
              <Link href="/contact?topic=event" className="btn btn-ghost">
                <span>Book us for your event</span>
              </Link>
            </div>
          </div>
          <div className="pop-phone reveal d2">
            <LiveOnly fallback={
              <div className="pop-qr-card pop-qr-off">
                <p>
                  <b>Live ordering opens at our pop-ups</b>
                  Find the QR code at the NeeksxArt booth. Follow @neeksxart for the next event.
                </p>
              </div>
            }>
              <div className="pop-qr-card">
                <TryQr className="pop-qr" id="tryQr" aria-label="QR code to order at the live pop-up" />
                <p>
                  <b>We&apos;re live now</b>
                  Scan to order at the booth
                </p>
              </div>
            </LiveOnly>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <span className="eyebrow reveal">How it works</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 46px" }}>
            Scan. Upload.{" "}
            <span className="script" style={{ textTransform: "none" }}>Keep.</span>
          </h2>
          <div className="steps light-steps pop-steps">
            <div className="step reveal">
              <h3>Scan</h3>
              <p>Point your camera at the QR code at the NeeksxArt booth. No app to download.</p>
            </div>
            <div className="step reveal d1">
              <h3>Pick a pack</h3>
              <p>Choose a bundle: 1, 3, 6 or 9 photo magnets ($7.99–$53.99), or a keychain pack.</p>
            </div>
            <div className="step reveal d2">
              <h3>Upload</h3>
              <p>Add photos from your camera roll, then drag and zoom each one to frame it just right.</p>
            </div>
            <div className="step reveal d3">
              <h3>Pick up</h3>
              <p>Get an order number, grab a drink, and pick up your pack in about 10–15 minutes.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow reveal">Bundle packs</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Pick your{" "}
                <span className="script" style={{ textTransform: "none" }}>pack</span>
              </h2>
            </div>
            <p className="lead reveal d2">Packs and pricing can change by event. Ask at the booth for today's lineup.</p>
          </div>
          <BundleCards className="pop-bundles" id="popBundles" />
        </div>
      </section>
      <section className="pad dark grain">
        <div className="wrap story-split">
          <div className="reveal">
            <div className="reel" style={{ aspectRatio: "9/16", maxWidth: "340px", marginInline: "auto" }}>
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/wedding-reel.jpg")}>
                <source src={media("video/wedding-reel.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Events</small>
                Guests leave with something they keep
              </div>
            </div>
          </div>
          <div>
            <span className="eyebrow reveal">Host a pop-up</span>
            <h2 className="reveal d1" style={{ margin: "14px 0 20px" }}>
              Bring the press{" "}
              <span className="script" style={{ textTransform: "none" }}>to your party</span>
            </h2>
            <p className="lead reveal d2">
              Weddings, birthdays, markets, brand activations, school events and grand openings. Guests scan, upload and walk away with a keepsake that lives on their fridge for years, and every piece can carry your event's branding.
            </p>
            <ul className="side-list reveal d2" style={{ margin: "26px 0 32px" }}>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"></path>
                </svg>
                {" "}Custom event branding on every piece
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6 6 0 0 1 5 18.4l-2.4-4a1.5 1.5 0 0 1 2.5-1.6L8 15"></path>
                </svg>
                {" "}Pressed live, in front of your guests
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"></path>
                </svg>
                {" "}Favors people actually keep
              </li>
            </ul>
            <Link href="/contact?topic=event" className="btn btn-orange reveal d3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"></path>
              </svg>
              {" "}Book NeeksxArt Live
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
