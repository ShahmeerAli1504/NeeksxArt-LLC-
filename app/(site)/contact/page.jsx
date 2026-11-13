import Link from 'next/link';
import { media } from '@/lib/media';
import LegacyMount from '@/components/LegacyMount';
import { pageMeta, webPage, breadcrumbs, faqPage } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata = pageMeta({
  title: "Contact & Bulk Orders | NeeksxArt LLC",
  description: "Ask about bulk orders, shipping, events, Tap-to-Connect and creative assistance. Reno-based and shipping nationwide.",
  path: '/contact'
});

// plain-text copy of the FAQ below, for FAQPage structured data (keep in sync with the <details> list)
const FAQS = [
  { q: 'Is there a minimum order?', a: "No strict minimums. Order a few pieces at the single price, or pick one of our bundle packs for a better price per piece. Need a quantity that isn't a bundle? Email or DM us and we'll sort it out." },
  { q: 'Do I need a mockup before I order?', a: 'Not for a simple photo or an established logo. Drop it into the Merch Studio at neeksxart.com/studio, download the preview and go straight to ordering. Your design prints exactly as uploaded.' },
  { q: 'Can you help me design my artwork?', a: "We aren't graphic designers, but creative assistance is available for custom logos and artwork for a small fee of $40–$60, depending on the complexity. Email or DM us to ask about it." },
  { q: 'How does payment work?', a: "Orders are paid in full at checkout, before production. For orders of $1,000 or more, email us at info@neeksxart.com before you order and we'll work out the details with you." },
  { q: 'Do you ship outside of Reno?', a: "Yes. Local delivery is free in Reno and Sparks. Shipping is a flat $8 on orders under $150, and free on out-of-state orders of $150 and over (merchandise subtotal before tax; Alaska and Hawaii excluded). If weather or an emergency means we can't deliver locally, we ship instead under the same terms." },
  { q: 'How long does an order take?', a: "It depends on the product, quantity and what's in the queue. Tell us your event date in the contact form and we'll let you know right away whether we can hit it." },
  { q: 'How does Tap-to-Connect work?', a: 'Each Tap-to-Connect keychain has an NFC chip inside. We program it with your link (Instagram, website, booking page, menu, anything) and any modern smartphone opens it with a tap. No app required.' },
  { q: 'What file should I send?', a: 'A high-resolution PNG with a transparent background is ideal. SVG, PDF, AI or a clear JPG work too. Your design prints exactly as uploaded, so send the original, highest-quality file you have. Creative assistance is $40–$60 depending on complexity.' }
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[webPage({ type: 'ContactPage', name: metadata.title.absolute, description: metadata.description, path: '/contact' }), breadcrumbs([['Contact', '/contact']]), faqPage(FAQS)]} />
      <section className="page-hero dark grain" style={{ paddingBottom: "60px" }}>
        <div className="wrap">
          <span className="eyebrow reveal">Contact & bulk orders</span>
          <h1 className="display reveal d1">
            Let's make{" "}
            <span className="script">something</span>
            {" "}they keep.
          </h1>
          <p className="lead reveal d2">
            Large order, event deadline, shipping question, or just want to talk ideas? Send a message and Neeks will get back to you. Need help creating your artwork? Ask about creative assistance.
          </p>
        </div>
      </section>
      <section className="pad" style={{ paddingTop: "60px" }}>
        <div className="wrap contact-grid">
          <form className="form-card" id="contactForm" noValidate>
            <div className="mock-attached" id="mockAttached">
              <img id="mockImg" alt="Your Merch Studio mockup" />
              <div>
                <strong>Your Merch Studio design is attached</strong>
                {" "}
                <small id="mockSummary"></small>
              </div>
              <button type="button" id="mockRemove">Remove</button>
            </div>
            <div className="field">
              <label>
                What can we help with?{" "}
                <em>*</em>
              </label>
              <div className="chips" id="topicChips">
                <label>
                  <input type="radio" name="topic" value="Bulk / large order" defaultChecked />
                  <span>Bulk / large order</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="Special order" />
                  <span>Special order</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="Event or wedding" />
                  <span>Event or wedding</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="Shipping question" />
                  <span>Shipping</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="Tap-to-Connect NFC" />
                  <span>Tap-to-Connect</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="Creative assistance" />
                  <span>Creative assistance</span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="topic" value="General question" />
                  <span>General question</span>
                </label>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="name">
                  Your name{" "}
                  <em>*</em>
                </label>
                <input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="business">Business / event</label>
                <input id="business" name="business" autoComplete="organization" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="email">
                  Email{" "}
                  <em>*</em>
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="product">Product</label>
                {" "}
                <select id="product" name="product">
                  <option value="">Not sure yet</option>
                  <option value="keychain">Custom keychains</option>
                  <option value="mirror">Mirror keychains</option>
                  <option value="magnet">Magnets</option>
                  <option value="button">Buttons</option>
                  <option value="pocket">3-inch pocket mirrors</option>
                  <option value="nfc">Tap-to-Connect keychains</option>
                  <option value="nfcmirror">Tap-to-Connect mirror keychains</option>
                  <option value="mix">A mix of products</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="quantity">Estimated quantity</label>
                {" "}
                <select id="quantity" name="quantity">
                  <option value="">Select</option>
                  <option>Under 25</option>
                  <option>25 – 49</option>
                  <option>50 – 99</option>
                  <option>100 – 249</option>
                  <option>250 – 499</option>
                  <option>500 – 999</option>
                  <option>1,000+</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="deadline">Need it by</label>
                <input id="deadline" name="deadline" type="date" />
              </div>
              <div className="field">
                <label htmlFor="shipTo">Ship to (city, state)</label>
                <input id="shipTo" name="shipTo" placeholder="Reno, NV" autoComplete="address-level2" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="message">
                Message{" "}
                <em>*</em>
              </label>
              {" "}
              <textarea id="message" name="message" required placeholder="Tell us about your brand or event, the look you're going for, and any questions about pricing, shipping or timelines." />
            </div>
            <div className="field">
              <label>
                Attach your logo{" "}
                <em style={{ color: "var(--text-soft)" }}>optional</em>
              </label>
              {" "}
              <label className="dropfile" id="fileLabel">
                <input type="file" id="logoFile" accept="image/*,.pdf,.ai,.eps,.svg" hidden />
                {" "}
                <span id="fileText">📎 Tap to attach a logo or artwork (max 2.5 MB)</span>
              </label>
            </div>
            <input type="text" name="company_site" id="hp" tabIndex="-1" autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
            {" "}
            <button className="btn btn-orange" type="submit" id="sendBtn" style={{ width: "100%" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"></path>
              </svg>
              {" "}Send message
            </button>
            <div className="form-status" id="formStatus" role="status"></div>
          </form>
          <aside>
            <div className="side-card">
              <h3>
                Why order{" "}
                <span className="script" style={{ textTransform: "none" }}>here</span>
              </h3>
              <ul className="side-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"></path>
                  </svg>
                  {" "}Creative assistance available ($40–$60)
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5"></path>
                  </svg>
                  {" "}No strict minimums
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 7l9-4 9 4-9 4-9-4z"></path>
                    <path d="M3 7v10l9 4 9-4V7M12 11v10"></path>
                  </svg>
                  {" "}Bundle pack pricing
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"></path>
                    <circle cx="12" cy="10" r="2.5"></circle>
                  </svg>
                  {" "}Reno-based, ships nationwide
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6 6 0 0 1 5 18.4l-2.4-4a1.5 1.5 0 0 1 2.5-1.6L8 15"></path>
                  </svg>
                  {" "}Hand-pressed & quality-checked
                </li>
              </ul>
            </div>
            <div className="side-card">
              <h3>Email us</h3>
              <p>Send your idea, photos or logo with the form. It goes straight to our inbox. For custom quantities, Tap-to-Connect or creative assistance, it&apos;s the fastest way.</p>
              <a className="email-card" href="#contactForm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
                <span>
                  info@neeksxart.com
                  <small>Custom orders, events & questions</small>
                </span>
              </a>
            </div>
            <div className="side-card">
              <h3>Prefer to DM?</h3>
              <p>We're most active on social. Slide into the DMs with your logo or question.</p>
              <div className="social-row">
                <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
                  </svg>
                  <span>
                    Instagram
                    <small>@neeksxart</small>
                  </span>
                </a>
                {" "}
                <a href="https://www.facebook.com/NEEKSxART/" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.6v3.6h2.7V22H14v-9.9h2.7l.4-3.6H14z"></path>
                  </svg>
                  <span>
                    Facebook
                    <small>NeeksxArt LLC</small>
                  </span>
                </a>
                {" "}
                <a href="https://www.tiktok.com/@neeksxart" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.5a7.9 7.9 0 0 0 4.4 1.3V6.5a4.5 4.5 0 0 1-4.4-4.5z"></path>
                  </svg>
                  <span>
                    TikTok
                    <small>@neeksxart</small>
                  </span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section className="pad paper-2" id="faq">
        <div className="wrap" style={{ maxWidth: "860px" }}>
          <span className="eyebrow">Good to know</span>
          <h2 style={{ margin: "14px 0 30px" }}>
            Questions,{" "}
            <span className="script" style={{ textTransform: "none" }}>answered</span>
          </h2>
          <div className="faq">
            <details open>
              <summary>Is there a minimum order?</summary>
              <p>
                No strict minimums. Order a few pieces at the single price, or pick one of our bundle packs for a better price per piece. Need a quantity that isn&apos;t a bundle? Email or DM us and we&apos;ll sort it out.
              </p>
            </details>
            <details>
              <summary>Do I need a mockup before I order?</summary>
              <p>
                Not for a simple photo or an established logo. Drop it into the{" "}
                <Link href="/studio" style={{ color: "var(--accent-text)", fontWeight: 800 }}>Merch Studio</Link>, download the preview and go straight to ordering. Your design prints exactly as uploaded.
              </p>
            </details>
            <details>
              <summary>Can you help me design my artwork?</summary>
              <p>
                We aren&apos;t graphic designers, but creative assistance is available for custom logos and artwork for a small fee of $40–$60, depending on the complexity. Email or DM us to ask about it.
              </p>
            </details>
            <details>
              <summary>How does payment work?</summary>
              <p>
                Orders are paid in full at checkout, before production. For orders of $1,000 or more, email us at info@neeksxart.com before you order and we&apos;ll work out the details with you. See our{" "}
                <Link href="/policy" style={{ color: "var(--accent-text)", fontWeight: 800 }}>orders & returns policy</Link>
                {" "}for details.
              </p>
            </details>
            <details>
              <summary>Do you ship outside of Reno?</summary>
              <p>
                We do. Local delivery is free in Reno and Sparks. Shipping is a flat $8 on orders under $150, and free on out-of-state orders of $150 and over (merchandise subtotal before tax; Alaska and Hawaii excluded). If weather or an emergency means we can&apos;t deliver locally, we ship instead under the same terms.
              </p>
            </details>
            <details>
              <summary>How long does an order take?</summary>
              <p>
                It depends on the product, quantity and what's in the queue. Tell us your event date in the form and we'll let you know right away whether we can hit it.
              </p>
            </details>
            <details>
              <summary>How does Tap-to-Connect work?</summary>
              <p>
                Each Tap-to-Connect keychain has an NFC chip inside. We program it with your link (Instagram, website, booking page, menu, anything) and any modern smartphone opens it with a tap. No app required.
              </p>
            </details>
            <details>
              <summary>What file should I send?</summary>
              <p>
                A high-resolution PNG with a transparent background is ideal. SVG, PDF, AI or a clear JPG work too. Your design prints exactly as uploaded, so send the original, highest-quality file you have. Need artwork made or cleaned up? Creative assistance is $40–$60 depending on complexity.
              </p>
            </details>
          </div>
        </div>
      </section>
      <LegacyMount module="contact" />
    </>
  );
}
