import Link from 'next/link';
import { media } from '@/lib/media';
import LegacyMount from '@/components/LegacyMount';

export const metadata = {
  title: "Events & Party Favors | NeeksxArt — Reno, NV",
  description: "Personalized party favors, keepsakes and matching merch for weddings, baby showers, quinceañeras, birthdays, graduations and company events. Free mockup and a personalized quote.",
  openGraph: { title: "Events & Party Favors | NeeksxArt — Reno, NV", description: "Personalized party favors, keepsakes and matching merch for weddings, baby showers, quinceañeras, birthdays, graduations and company events. Free mockup and a personalized quote.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/favors' },
};

export default function FavorsPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Events & party favors</span>
          <h1 className="display reveal d1">
            Make the occasion{" "}
            <span className="script">something to keep.</span>
          </h1>
          <p className="lead reveal d2">
            Personalized favors, keepsakes, giveaways and matching merch for celebrations and business events. We build each bundle around your theme, products and quantity, then send you a personalized quote.
          </p>
          <div className="hero-ctas reveal d3" style={{ marginTop: "30px" }}>
            <a href="#quote" className="btn btn-orange">
              Request an event quote{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </a>
            <Link href="/events" className="btn btn-ghost">
              <span>Book a live pop-up</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <span className="eyebrow reveal">Perfect for</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 34px" }}>
            Every kind of{" "}
            <span className="script" style={{ textTransform: "none" }}>celebration</span>
          </h2>
          <div className="occasions reveal d2">
            <span>Baby showers</span>
            <span>Weddings & save-the-dates</span>
            <span>Company holiday parties</span>
            <span>Quinceañeras & debuts</span>
            <span>Birthdays & anniversaries</span>
            <span>Graduations</span>
            <span>Any special occasion</span>
          </div>
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">Gallery</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Made for moments{" "}
                <span className="script" style={{ textTransform: "none" }}>like yours</span>
              </h2>
            </div>
            <Link href="/work" className="link-arrow reveal d2">
              See more of our work{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <div className="favor-gallery">
            <figure className="reveal" data-lightbox="">
              <img src={"https://cdn.shopify.com/s/files/1/0858/2486/4477/files/646E5FBD-49A6-49E2-88AD-961CB02ADBAA-photo-BBFAA29D-737E-4916-8971-5721A8A5783E.jpg?v=1793673644&width=900"} alt="18th birthday keepsake" loading="lazy" />
              <figcaption>18th birthday keepsake</figcaption>
            </figure>
            <figure className="reveal" data-lightbox="">
              <img src={"https://cdn.shopify.com/s/files/1/0858/2486/4477/files/C56182C6-1FF9-4D1C-8F79-DDB114B37385-photo-C1CB3631-78D1-4D84-9F9F-1EA25075F6AE.jpg?v=1793673643&width=900"} alt="Wedding magnet" loading="lazy" />
              <figcaption>Wedding magnet</figcaption>
            </figure>
            <figure className="reveal" data-lightbox="">
              <img src={"https://cdn.shopify.com/s/files/1/0858/2486/4477/files/0F5740E7-2FE7-478A-8685-64D427C61B24-photo-46EB04F8-AADE-4A1F-8BF3-2EDAF8482E80.jpg?v=1793673643&width=900"} alt="Matching wedding favors" loading="lazy" />
              <figcaption>Matching wedding favors</figcaption>
            </figure>
            <figure className="reveal" data-lightbox="">
              <img src={"https://cdn.shopify.com/s/files/1/0858/2486/4477/files/D82B8880-895B-49F8-897D-0B317A036FB1-photo-C01E486F-6837-4B62-B8D9-BABD871C58C5.jpg?v=1793673644&width=900"} alt="Personalized birthday magnet" loading="lazy" />
              <figcaption>Personalized birthday magnet</figcaption>
            </figure>
            <figure className="reveal" data-lightbox="">
              <img src={"https://cdn.shopify.com/s/files/1/0858/2486/4477/files/4A5DB143-2092-4662-908B-0FB5BCB2B9BF-photo-2F57C209-4136-4220-806E-C2266F7FE8F9.jpg?v=1793673644&width=900"} alt="Quinceañera mirror keychain" loading="lazy" />
              <figcaption>Quinceañera mirror keychain</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="pad" id="quote">
        <div className="wrap contact-grid">
          <form className="form-card" id="quoteForm" noValidate>
            <span className="eyebrow">Free mockup included</span>
            <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", margin: "12px 0 10px" }}>
              Request an{" "}
              <span className="script" style={{ textTransform: "none" }}>event quote</span>
            </h2>
            <p style={{ color: "var(--text-soft)", marginBottom: "24px" }}>
              Tell us about your event. We'll work with you on product options, quantities and pricing, and send a free digital mockup before production.
            </p>
            <div className="field-row">
              <div className="field">
                <label htmlFor="qName">
                  Name{" "}
                  <em>*</em>
                </label>
                <input id="qName" name="name" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="qEmail">
                  Email{" "}
                  <em>*</em>
                </label>
                <input id="qEmail" name="email" type="email" autoComplete="email" required />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="qDate">Event date</label>
                <input id="qDate" name="deadline" type="date" />
              </div>
              <div className="field">
                <label htmlFor="qType">Event type & theme</label>
                <input id="qType" name="business" placeholder="Baby shower, pastel florals" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="qQty">Estimated quantity</label>
                {" "}
                <select id="qQty" name="quantity">
                  <option value="">Select</option>
                  <option>Under 25</option>
                  <option>25 – 49</option>
                  <option>50 – 99</option>
                  <option>100 – 249</option>
                  <option>250+</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="qBudget">
                  Budget{" "}
                  <em style={{ color: "var(--text-soft)" }}>optional</em>
                </label>
                <input id="qBudget" name="budget" placeholder="$" />
              </div>
            </div>
            <div className="field">
              <label>Product preferences</label>
              <div className="chips">
                <label>
                  <input type="checkbox" name="prefs" value="Magnets" />
                  <span>Magnets</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Keychains" />
                  <span>Keychains</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Mirror keychains" />
                  <span>Mirror keychains</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Pocket mirrors" />
                  <span>Pocket mirrors</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Buttons" />
                  <span>Buttons</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Tap-to-Connect" />
                  <span>Tap-to-Connect</span>
                </label>
                {" "}
                <label>
                  <input type="checkbox" name="prefs" value="Not sure yet" />
                  <span>Not sure yet</span>
                </label>
              </div>
            </div>
            <div className="field">
              <label htmlFor="qMsg">
                Tell us about your event{" "}
                <em>*</em>
              </label>
              <textarea id="qMsg" name="message" required placeholder="Guest count, colors, photos you'd like to use, packaging ideas…" />
            </div>
            <input type="text" name="company_site" tabIndex="-1" autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
            {" "}
            <button className="btn btn-orange" type="submit" id="qBtn" style={{ width: "100%" }}>
              Request an event quote{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </button>
            <div className="form-status" id="qStatus" role="status"></div>
          </form>
          <aside>
            <div className="side-card">
              <h3>
                Prefer{" "}
                <span className="script" style={{ textTransform: "none" }}>email?</span>
              </h3>
              <p>Send your event details, date and any photos straight to our inbox.</p>
              <a className="email-card" href="mailto:info@neeksxart.com?subject=Event%20quote%20request">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
                <span>
                  info@neeksxart.com
                  <small>We reply with ideas and a free mockup</small>
                </span>
              </a>
            </div>
            <div className="side-card">
              <h3>
                Want it{" "}
                <span className="script" style={{ textTransform: "none" }}>live?</span>
              </h3>
              <p>
                Book NeeksxArt Live for your event. Guests scan a QR code, upload photos and pick up their magnets in 10–15 minutes.
              </p>
              <Link href="/events" className="link-arrow" style={{ marginTop: "18px", color: "var(--paper)" }}>
                See how pop-ups work{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <LegacyMount module="quote" />
    </>
  );
}
