import Link from 'next/link';
import { media } from '@/lib/media';

export const metadata = {
  title: "NeeksxArt LLC | Custom Keychains, Mirrors, Magnets & Buttons — Reno, NV",
  description: "Merch people actually keep. Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch, hand-pressed in Reno, NV. Free logo mockups, bulk pricing, ships nationwide.",
  openGraph: { title: "NeeksxArt LLC | Custom Keychains, Mirrors, Magnets & Buttons — Reno, NV", description: "Merch people actually keep. Custom keychains, mirror keychains, magnets, buttons and tap-to-connect NFC merch, hand-pressed in Reno, NV. Free logo mockups, bulk pricing, ships nationwide.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <section className="hero dark grain">
        <div className="hero-bg-word" aria-hidden="true">Neeks</div>
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow reveal">Your photos. Your artwork. Made personal.</span>
            <h1 className="display reveal d1">
              Merch people actually keep.
              <span className="script">beyond the screen</span>
            </h1>
            <p className="lead reveal d2">
              Custom 2.5-inch photo magnets, buttons, keychains, mirrors and tap-to-connect smart merch, hand-pressed one by one in Reno. Email your idea, approve a free mockup, and we make it.
            </p>
            <div className="hero-ctas reveal d3">
              <Link href="/studio" className="btn btn-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4M7 9l5-5 5 5"></path>
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                </svg>
                {" "}Upload your logo
              </Link>
              {" "}
              <Link href="/magnets" className="btn btn-ghost">
                <span>Shop custom magnets</span>
              </Link>
            </div>
            <div className="hero-facts reveal d3">
              <div>
                <strong>$0.60</strong>
                Bulk pricing from
              </div>
              <div>
                <strong>Free</strong>
                Logo mockups
              </div>
              <div>
                <strong>No</strong>
                Minimum orders
              </div>
            </div>
          </div>
          <div className="hero-badge reveal d2">
            <svg className="ring-text" viewBox="0 0 500 500" aria-hidden="true">
              <defs>
                <path id="ring" d="M250,250 m-228,0 a228,228 0 1,1 456,0 a228,228 0 1,1 -456,0"></path>
              </defs>
              <text>
                <textPath href="#ring" textLength="1430">
                  Keychains{" "}
                  <tspan className="dot">✺</tspan>
                  {" "}Mirrors{" "}
                  <tspan className="dot">✺</tspan>
                  {" "}Magnets{" "}
                  <tspan className="dot">✺</tspan>
                  {" "}Buttons{" "}
                  <tspan className="dot">✺</tspan>
                  {" "}Tap-to-connect{" "}
                  <tspan className="dot">✺</tspan>
                  {" "}Hand-pressed in Reno{" "}
                  <tspan className="dot">✺</tspan>
                </textPath>
              </text>
            </svg>
            <div className="dome">
              <video data-autoplay="" muted loop playsInline preload="metadata" poster={media("video/press-bw.jpg")} aria-label="A button being hand-pressed in the NeeksxArt studio">
                <source src={media("video/press-bw.mp4")} type="video/mp4" />
              </video>
            </div>
            <div className="hero-sticker">
              No minimums
              <span>for real</span>
            </div>
          </div>
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Free logo mockups</span>
          <span>Bulk pricing</span>
          <span>Mirror keychains</span>
          <span>Live pop-ups</span>
          <span>Tap-to-connect NFC</span>
          <span>Ships nationwide</span>
          <span>Keep Reno rad</span>
          {" "}
          <span>Free logo mockups</span>
          <span>Bulk pricing</span>
          <span>Mirror keychains</span>
          <span>Live pop-ups</span>
          <span>Tap-to-connect NFC</span>
          <span>Ships nationwide</span>
          <span>Keep Reno rad</span>
        </div>
      </div>
      <section className="pad">
        <div className="wrap">
          <span className="eyebrow reveal">Why NeeksxArt</span>
          <h2 className="reveal d1" style={{ marginTop: "14px", maxWidth: "16ch" }}>
            Most swag ends up in a drawer.{" "}
            <span className="script" style={{ textTransform: "none" }}>Ours ends up on keyrings.</span>
          </h2>
          <div className="versus">
            <div className="vs-card vs-tossed reveal">
              <h3>Typical giveaways</h3>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18"></path>
                  </svg>
                  {" "}Flimsy pens and stickers that peel in a week
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18"></path>
                  </svg>
                  {" "}Forgotten the minute the event ends
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18"></path>
                  </svg>
                  {" "}Huge minimums before you can even start
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18"></path>
                  </svg>
                  {" "}Your logo, lost in a junk drawer
                </li>
              </ul>
            </div>
            <div className="vs-card vs-kept reveal d1">
              <h3>
                NeeksxArt{" "}
                <span className="script">merch</span>
              </h3>
              <ul>
                <li>
                  <span style={{ color: "var(--orange)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5"></path>
                    </svg>
                  </span>
                  {" "}Functional keepsakes people use every single day
                </li>
                <li>
                  <span style={{ color: "var(--orange)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5"></path>
                    </svg>
                  </span>
                  {" "}On their keys, their fridge, their bag, their jacket
                </li>
                <li>
                  <span style={{ color: "var(--orange)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5"></path>
                    </svg>
                  </span>
                  {" "}No minimums, free mockups, tiered bulk pricing
                </li>
                <li>
                  <span style={{ color: "var(--orange)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5"></path>
                    </svg>
                  </span>
                  {" "}Your brand stays visible long after the event
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="pad paper-2" id="products">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow reveal">The lineup</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Pick your{" "}
                <span className="script" style={{ textTransform: "none" }}>keeper</span>
              </h2>
            </div>
            <p className="lead reveal d2">
              Every piece is printed, pressed and packed by hand in our Reno studio. Tap any product to design yours, or browse the{" "}
              <Link href="/catalog" style={{ color: "var(--orange)", fontWeight: 800 }}>full catalog</Link>
              {" "}with pricing.
            </p>
          </div>
          <div className="products">
            <article className="product reveal">
              <span className="tag">Classic</span>
              <div className="product-art">
                <img src={media("img/nextlevel-2.jpg")} alt="Next Level 775 car audio shop custom button keychains" loading="lazy" />
              </div>
              <h3>Custom Keychains</h3>
              <p className="shop-from" style={{ fontWeight: 800, color: "var(--ink)" }}>From $2.50 each</p>
              <p>
                Glossy domed keychains with split ring and chain. The thing nobody throws away: their keys.
              </p>
              <div className="uses">
                <span>Shops</span>
                <span>Dealers</span>
                <span>Brands</span>
              </div>
              <Link className="link-arrow" href="/studio?product=keychain">
                Design one{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </article>
            <article className="product reveal d1">
              <span className="tag hot">Best seller</span>
              <div className="product-art">
                <img src={media("img/mirror-pink.jpg")} alt="Pink Hairbyadilenexoxo mirror keychain with tassel" loading="lazy" style={{ objectPosition: "50% 35%" }} />
              </div>
              <h3>Mirror Keychains</h3>
              <p className="shop-from" style={{ fontWeight: 800, color: "var(--ink)" }}>From $6.50 each · full package</p>
              <p>
                Your logo on the front, a real pocket mirror on the back. Lash artists, salons and beauty brands love these.
              </p>
              <div className="uses">
                <span>Salons</span>
                <span>Lash artists</span>
                <span>Gifts</span>
              </div>
              <Link className="link-arrow" href="/studio?product=mirror">
                Design one{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </article>
            <article className="product reveal d2">
              <span className="tag">Events</span>
              <div className="product-art">
                <img src={media("img/wedding-buttons.jpg")} alt="Custom wedding photo magnets and buttons" loading="lazy" />
              </div>
              <h3>Magnets</h3>
              <p className="shop-from" style={{ fontWeight: 800, color: "var(--ink)" }}>From $2.75 each</p>
              <p>
                Photo magnets and logo magnets that live on the fridge for years. Perfect for weddings, parties and restaurants.
              </p>
              <div className="uses">
                <span>Weddings</span>
                <span>Restaurants</span>
                <span>Birthdays</span>
              </div>
              <Link className="link-arrow" href="/studio?product=magnet">
                Design one{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </article>
            <article className="product reveal">
              <div className="product-art">
                <img src={media("img/logo-button.jpg")} alt="NeeksxArt logo glossy button" loading="lazy" style={{ objectFit: "contain", background: "#0b0b0b" }} />
              </div>
              <h3>Buttons</h3>
              <p className="shop-from" style={{ fontWeight: 800, color: "var(--ink)" }}>From $0.60 each</p>
              <p>
                Vibrant, high-fidelity pin-back buttons. Statement pieces for bands, campaigns, fundraisers and merch tables.
              </p>
              <div className="uses">
                <span>Bands</span>
                <span>Nonprofits</span>
                <span>Schools</span>
                <span>Tattoo shops</span>
              </div>
              <Link className="link-arrow" href="/studio?product=button">
                Design one{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </article>
            <article className="product reveal d1">
              <span className="tag" style={{ background: "var(--orange)" }}>Smart merch</span>
              <div className="product-art">
                <img src={media("img/weezy-nfc.jpg")} alt="Weezy tap-to-connect NFC keychain" loading="lazy" style={{ objectPosition: "50% 45%" }} />
              </div>
              <h3>Tap-to-Connect</h3>
              <p className="shop-from" style={{ fontWeight: 800, color: "var(--ink)" }}>From $8.00 each</p>
              <p>
                An NFC chip inside your keychain. One tap on a phone opens your Instagram, website, booking page or menu. No app needed.
              </p>
              <div className="uses">
                <span>DJs</span>
                <span>Creators</span>
                <span>Networking</span>
                <span>Business cards</span>
              </div>
              <Link className="link-arrow" href="/studio?product=nfc">
                Design one{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </article>
          </div>
        </div>
      </section>
      <section className="pad dark-2" style={{ paddingTop: "clamp(56px,7vw,90px)", paddingBottom: "clamp(56px,7vw,90px)" }}>
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: "34px" }}>
            <div>
              <span className="eyebrow reveal">How ordering works</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Idea to keepsake{" "}
                <span className="script" style={{ textTransform: "none" }}>in 3 steps</span>
              </h2>
            </div>
            <a href="mailto:info@neeksxart.com?subject=Custom%20merchandise%20inquiry" className="btn btn-orange reveal d2">Request a free mockup</a>
          </div>
          <div className="steps steps-3 reveal d2">
            <div className="step">
              <h3>Email your idea</h3>
              <p>Send photos, artwork or your logo to info@neeksxart.com.</p>
            </div>
            <div className="step">
              <h3>Review your mockup</h3>
              <p>We send a free digital mockup so you can approve every detail.</p>
            </div>
            <div className="step">
              <h3>We make it</h3>
              <p>Production starts once you approve, hand-pressed in Reno.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pad dark grain">
        <div className="wrap teaser">
          <div className="teaser-visual reveal">
            <div className="t-item t1">
              <img src={media("img/nextlevel-1.jpg")} alt="" loading="lazy" style={{ objectPosition: "60% 50%" }} />
            </div>
            <div className="t-item t2">
              <img src={media("img/mirror-pink-card.jpg")} alt="" loading="lazy" />
            </div>
            <div className="t-item t3">
              <img src={media("img/weezy-pack.jpg")} alt="" loading="lazy" style={{ objectPosition: "50% 70%" }} />
            </div>
            <div className="upload-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4M7 9l5-5 5 5"></path>
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
              </svg>
              {" "}your-logo.png → live preview
            </div>
          </div>
          <div>
            <span className="eyebrow reveal">The Merch Studio</span>
            <h2 className="reveal d1" style={{ margin: "14px 0 20px" }}>
              See it before{" "}
              <span className="script" style={{ textTransform: "none" }}>we press it</span>
            </h2>
            <p className="lead reveal d2">
              Drop in your logo and preview it instantly on every product. Pick the size, hardware, tassel and packaging, flip it to see the back, then send it to us for a free, print-ready mockup.
            </p>
            <div className="steps reveal d2" style={{ gridTemplateColumns: "1fr 1fr", margin: "34px 0" }}>
              <div className="step">
                <h3>Upload</h3>
                <p>PNG, JPG or SVG. Logos, photos, artwork.</p>
              </div>
              <div className="step">
                <h3>Customize</h3>
                <p>Product, size, hardware, tassel, packaging.</p>
              </div>
              <div className="step">
                <h3>Mockup</h3>
                <p>We send a free proof you can approve.</p>
              </div>
              <div className="step">
                <h3>Press & ship</h3>
                <p>Hand-pressed in Reno, shipped nationwide.</p>
              </div>
            </div>
            <Link href="/studio" className="btn btn-orange reveal d3">
              Open the Merch Studio{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow reveal">Fresh off the press</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Recent{" "}
                <span className="script" style={{ textTransform: "none" }}>drops</span>
              </h2>
            </div>
            <Link href="/work" className="link-arrow reveal d2">
              View the full portfolio{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
          <div className="masonry">
            <figure className="reveal" data-lightbox="">
              <img src={media("img/nextlevel-1.jpg")} alt="Next Level 775 car audio shop keychains" loading="lazy" />
              <figcaption>
                <span>Next Level 775</span>
                <span>Keychains</span>
              </figcaption>
            </figure>
            <figure className="reveal d1" data-lightbox="">
              <img src={media("img/mirror-pink-card.jpg")} alt="Hairbyadilenexoxo mirror keychain on a custom backer card" loading="lazy" />
              <figcaption>
                <span>Hairbyadilenexoxo</span>
                <span>Mirrors</span>
              </figcaption>
            </figure>
            <figure className="reveal d2" data-lightbox="">
              <img src={media("img/weezy-pack.jpg")} alt="Weezy keychain packaged on a black backer card" loading="lazy" />
              <figcaption>
                <span>Weezy</span>
                <span>Keychain</span>
              </figcaption>
            </figure>
            <figure className="reveal" data-lightbox="">
              <img src={media("img/wedding-buttons.jpg")} alt="Wedding photo buttons" loading="lazy" />
              <figcaption>
                <span>Wedding favors</span>
                <span>Magnets</span>
              </figcaption>
            </figure>
            <figure className="reveal d1" data-lightbox="">
              <img src={media("img/weezy-nfc.jpg")} alt="Weezy tap-to-connect NFC keychain" loading="lazy" />
              <figcaption>
                <span>Weezy</span>
                <span>Tap-to-connect</span>
              </figcaption>
            </figure>
            <figure className="reveal d2" data-lightbox="">
              <img src={media("img/nextlevel-2.jpg")} alt="Next Level 775 keychains with split rings" loading="lazy" />
              <figcaption>
                <span>Next Level 775</span>
                <span>Keychains</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="pad dark-2">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow reveal">Behind the press</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Made by hand.{" "}
                <span className="script" style={{ textTransform: "none" }}>Every one.</span>
              </h2>
            </div>
            <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" className="btn btn-ghost reveal d2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
              </svg>
              {" "}
              <span>@neeksxart</span>
            </a>
          </div>
          <div className="reels">
            <div className="reel reveal">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/keys-reel.jpg")}>
                <source src={media("video/keys-reel.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Keychains</small>
                Nobody throws away their keys.
              </div>
            </div>
            <div className="reel reveal d1">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/mirror-flip.jpg")}>
                <source src={media("video/mirror-flip.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Mirror keychains</small>
                Wait for the flip…
              </div>
            </div>
            <div className="reel reveal d2">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/wedding-reel.jpg")}>
                <source src={media("video/wedding-reel.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Events</small>
                Wedding favors, boxed & ready
              </div>
            </div>
            <div className="reel reveal d3">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/press-bw.jpg")}>
                <source src={media("video/press-bw.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Buttons</small>
                300 of 600 for Endless Ink Reno
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pad dark-2" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="live-band reveal">
            <div>
              <span className="eyebrow">New · NeeksxArt Live</span>
              <h2 style={{ margin: "12px 0 14px" }}>
                Pressed at the pop-up.{" "}
                <span className="script" style={{ textTransform: "none" }}>Ready in 15.</span>
              </h2>
              <p className="lead">
                Scan the QR code at our booth, upload your photos, and pick up your magnets before your drink is done. Live magnets from $7.99, nine for $53.99.
              </p>
            </div>
            <div className="live-ctas">
              <Link href="/events" className="btn btn-orange">
                See how it works{" "}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6"></path>
                </svg>
              </Link>
              {" "}
              <Link href={"/event?e=demo&new=1"} className="btn btn-ghost">
                <span>Try it on your phone</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <span className="eyebrow reveal">Who we make for</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 40px" }}>
            If you have a logo,{" "}
            <span className="script" style={{ textTransform: "none" }}>we've got you.</span>
          </h2>
          <div className="who reveal d2">
            <span>Small businesses</span>
            <span>Salons & lash artists</span>
            <span>Tattoo shops</span>
            <span>Car culture</span>
            <span>Coffee & restaurants</span>
            <span>Creators & DJs</span>
            <span>Nonprofits</span>
            <span>Schools</span>
            <span>Weddings</span>
            <span>Birthdays</span>
            <span>Bands</span>
            <span>Fundraisers</span>
          </div>
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap story-split">
          <div className="story-photo reveal">
            <img src={media("img/neeks-studio.jpg")} alt="Neeks holding a NeeksxArt keychain in the studio surrounded by fresh orders" loading="lazy" />
            {" "}
            <img className="stamp dome" src={media("img/logo-button.jpg")} alt="" style={{ borderRadius: "50%" }} />
          </div>
          <div>
            <span className="eyebrow reveal">From the studio</span>
            <h2 className="reveal d1" style={{ marginTop: "14px" }}>
              Built by{" "}
              <span className="script" style={{ textTransform: "none" }}>community</span>
            </h2>
            <p className="quote reveal d2">
              I seriously appreciate everyone who has supported NeeksxArt, especially the local businesses, creators, nonprofits, and community that have trusted me with their merch.
            </p>
            <p className="sig reveal d2">— Neeks</p>
            <Link href="/story" className="link-arrow reveal d3" style={{ marginTop: "26px" }}>
              Read our story{" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>
                Your logo,{" "}
                <span className="script" style={{ textTransform: "none" }}>but make it merch.</span>
              </h2>
              <p>
                Send us your logo and get a free custom mockup. Ordering 25 or 2,500? Ask about bulk pricing and nationwide shipping.
              </p>
            </div>
            <div className="ctas">
              <Link href="/studio" className="btn btn-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4M7 9l5-5 5 5"></path>
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                </svg>
                {" "}Start in the Studio
              </Link>
              {" "}
              <Link href="/pricing" className="btn btn-ghost" style={{ color: "#fff" }}>
                <span>Estimate your price</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
