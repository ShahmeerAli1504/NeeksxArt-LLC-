import { media } from '@/lib/media';
import { CHECKOUT } from '@/lib/checkout';

export const metadata = {
  title: "Custom Orders, Shipping, Live Magnets & Returns Policy | NeeksxArt",
  description: "NeeksxArt LLC policy for custom and bulk orders, live photo magnets, returns, cancellations, artwork rights and social media permission.",
  openGraph: { title: "Custom Orders, Shipping, Live Magnets & Returns Policy | NeeksxArt", description: "NeeksxArt LLC policy for custom and bulk orders, live photo magnets, returns, cancellations, artwork rights and social media permission.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/policy' },
};

export default function PolicyPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Policies</span>
          <h1 className="display reveal d1">
            Orders, live magnets{" "}
            <span className="script">& returns</span>
          </h1>
          <p className="lead reveal d2">
            How custom orders, shipping, live event magnets, returns and cancellations work at NeeksxArt LLC. Clear and simple, so every order goes smoothly.
          </p>
        </div>
      </section>
      <section className="pad">
        <div className="wrap policy">
          <span className="eff">Effective October 18, 2026</span>
          <h2>1. Custom & bulk orders</h2>
          <p>
            This covers custom magnets, keychains, mirror keychains, buttons, promotional items, event favors and other personalized products ordered directly from NeeksxArt.
          </p>
          <h3>Design approval</h3>
          <ul>
            <li>
              You provide the logos, photos, text and other design elements. We create a free digital mockup for you.
            </li>
            <li>Please check everything carefully: spelling, colors, contact info and QR codes.</li>
            <li>
              Production starts only after you approve the design and payment is received. Changes after production starts may not be possible and may cost extra.
            </li>
            <li>
              <strong>We print as-is.</strong>
              {" "}Designs print exactly as uploaded. We don&apos;t retouch, clean up or redraw your artwork, so if an image is low resolution, blurry or a screenshot, it prints that way. Please send the original, highest-quality file you have.
            </li>
            <li>Colors and placement on screen can differ slightly from the printed product.</li>
          </ul>
          <h3>Payment</h3>
          <ul>
            <li>Orders under $150 are paid in full before production.</li>
            <li>
              Orders of $150 or more need at least a 50% deposit, with the balance due before shipping or delivery.
            </li>
            <li>
              Sales tax and shipping are shown at checkout (see Shipping &amp; local delivery below). Production time depends on order size, complexity and materials.
            </li>
          </ul>
          <h3>If we make a mistake</h3>
          <p>
            If we cause an error (wrong artwork or text, wrong quantity or product, significant defects, or something missing from your approved mockup), we'll fix it, usually by remaking the affected pieces at no charge. Please contact us within 7 days of receiving your order with your order details and clear photos. Only the affected pieces are remade. Issues caused by an approved design, incorrect customer information or changes after production generally don't qualify for a free remake. This policy doesn't limit your legal rights.
          </p>
          <h2 id="shipping">2. Shipping &amp; local delivery</h2>
          <ul>
            <li>
              <strong>Free local delivery in Reno &amp; Sparks.</strong>
              {" "}Choose local delivery at checkout for any Reno or Sparks address. If weather, a family emergency or something similar means we can&apos;t deliver, we&apos;ll ship your order instead and the standard ${(CHECKOUT.shipping.flatCents / 100).toFixed(2)} shipping fee applies.
            </li>
            <li>
              <strong>${(CHECKOUT.shipping.flatCents / 100).toFixed(0)} flat-rate shipping</strong>
              {" "}on orders under ${CHECKOUT.shipping.freeOverCents / 100}.
            </li>
            <li>
              <strong>Free shipping on out-of-state orders over ${CHECKOUT.shipping.freeOverCents / 100}</strong>
              {" "}— based on the merchandise subtotal before tax. Alaska and Hawaii are excluded.
            </li>
            <li>Live pop-up orders are picked up at the booth and don&apos;t ship.</li>
          </ul>
          <h2>3. Live photo magnets (event orders)</h2>
          <p>
            Live magnets are 2.5-inch square magnets made on-site at participating events. You pick a bundle, upload your photos and pay before production.
          </p>
          <ul>
            <li>
              <strong>Your photos:</strong>
              {" "}you choose, upload and crop them. Use the best originals you have. We don't retouch images, so blurry, dark or low-resolution photos print that way. Screenshots and social media downloads aren't recommended.
            </li>
            <li>
              <strong>Returns:</strong>
              {" "}sales are final for photo quality, photo choice and cropping, for changes of mind after production starts, and for small screen-to-print color differences. If we make a verified error, like the wrong photo, wrong quantity or a defective magnet, we'll correct, replace or refund it.
            </li>
            <li>
              <strong>Event-only, pickup only:</strong>
              {" "}live ordering is open only during NeeksxArt pop-up events, and orders are picked up on-site at the NeeksxArt booth. Live orders don&apos;t ship. Keep your order number handy. Wait times depend on attendance and order volume.
            </li>
          </ul>
          <h2>4. Social media, photography & permission</h2>
          <p>
            We may ask to photograph your products, share finished pieces, tag your business or collaborate. We always ask before publicly sharing identifiable orders, personal photos or your branding. Saying no never affects quality, pricing or fulfillment.
          </p>
          <p>
            Identifiable children under 18 are never used for promotion without separate, verified permission from a parent or guardian. Consent choices and final mockup approvals are recorded with the order.
          </p>
          <h2>5. Your artwork & image rights</h2>
          <p>
            By sending us materials, you confirm you own them or have permission to use them. We use them only to make and fulfill your order, never for unrelated promotion.
          </p>
          <h2>6. Cancellations</h2>
          <ul>
            <li>Every product is made just for you, so please cancel as soon as possible.</li>
            <li>
              Orders canceled before production may be refunded, minus any agreed nonrefundable charges for work already done.
            </li>
            <li>
              After production starts, refunds depend on the work completed and applicable law. Live magnet orders generally can't be canceled once personalization begins.
            </li>
          </ul>
          <h2>7. Contact</h2>
          <p>
            Email{" "}
            <a href="mailto:info@neeksxart.com" style={{ color: "var(--accent-text)", fontWeight: 800 }}>info@neeksxart.com</a>
            {" "}or DM{" "}
            <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" style={{ color: "var(--accent-text)", fontWeight: 800 }}>@neeksxart</a>
            {" "}with your order number, a description of the issue and photos if relevant.
          </p>
        </div>
      </section>
    </>
  );
}
