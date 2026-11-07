import Link from 'next/link';
import { media } from '@/lib/media';

export const metadata = {
  title: "Our Work | Custom Merch Portfolio — NeeksxArt LLC",
  description: "Keychains, mirror keychains, buttons, magnets and tap-to-connect merch made for Reno businesses, creators and events.",
  openGraph: { title: "Our Work | Custom Merch Portfolio — NeeksxArt LLC", description: "Keychains, mirror keychains, buttons, magnets and tap-to-connect merch made for Reno businesses, creators and events.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap">
          <span className="eyebrow reveal">Portfolio</span>
          <h1 className="display reveal d1">
            Pressed for{" "}
            <span className="script">the people</span>
          </h1>
          <p className="lead reveal d2">
            Car audio shops, hair stylists, DJs, tattoo studios and newlyweds. Every brand gets merch that looks like them, built to stay in pockets and on fridges.
          </p>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="filters" role="group" aria-label="Filter work">
            <button className="on" data-filter="all">All</button>
            {" "}
            <button data-filter="keychain">Keychains</button>
            {" "}
            <button data-filter="mirror">Mirror keychains</button>
            {" "}
            <button data-filter="nfc">Tap-to-connect</button>
            {" "}
            <button data-filter="button">Buttons & magnets</button>
            {" "}
            <button data-filter="event">Events</button>
          </div>
          <div className="masonry">
            <figure data-cat="keychain" data-lightbox="">
              <img src={media("img/nextlevel-1.jpg")} alt="Next Level 775 car audio shop domed keychains" loading="lazy" />
              <figcaption>
                <span>Next Level 775</span>
                <span>Keychains</span>
              </figcaption>
            </figure>
            <figure data-cat="mirror" data-lightbox="">
              <img src={media("img/mirror-pink.jpg")} alt="Hairbyadilenexoxo pink mirror keychain with gold hardware and tassel" loading="lazy" />
              <figcaption>
                <span>Hairbyadilenexoxo</span>
                <span>Mirror</span>
              </figcaption>
            </figure>
            <figure data-cat="nfc" data-lightbox="">
              <img src={media("img/weezy-nfc.jpg")} alt="Weezy tap-to-connect NFC keychain on backer card" loading="lazy" />
              <figcaption>
                <span>Weezy</span>
                <span>Tap-to-connect</span>
              </figcaption>
            </figure>
            <figure data-cat="button event" data-lightbox="">
              <img src={media("img/wedding-buttons.jpg")} alt="Sierra and Ray wedding photo buttons" loading="lazy" />
              <figcaption>
                <span>Wedding favors</span>
                <span>Buttons</span>
              </figcaption>
            </figure>
            <figure data-cat="keychain" data-lightbox="">
              <img src={media("img/weezy-pack.jpg")} alt="Weezy keychain in clear sleeve with black backer card" loading="lazy" />
              <figcaption>
                <span>Weezy</span>
                <span>Keychain + card</span>
              </figcaption>
            </figure>
            <figure data-cat="mirror" data-lightbox="">
              <img src={media("img/mirror-pink-card.jpg")} alt="Mirror keychain packaged on a custom pink backer card" loading="lazy" />
              <figcaption>
                <span>Hairbyadilenexoxo</span>
                <span>Backer card</span>
              </figcaption>
            </figure>
            <figure data-cat="keychain" data-lightbox="">
              <img src={media("img/nextlevel-2.jpg")} alt="Next Level 775 keychains with split rings and chains" loading="lazy" />
              <figcaption>
                <span>Next Level 775</span>
                <span>Keychains</span>
              </figcaption>
            </figure>
            <figure data-cat="button" data-lightbox="">
              <img src={media("img/logo-button.jpg")} alt="NeeksxArt logo glossy button" loading="lazy" />
              <figcaption>
                <span>NeeksxArt</span>
                <span>Button</span>
              </figcaption>
            </figure>
            <figure data-cat="keychain event" data-lightbox="">
              <img src={media("img/neeks-studio.jpg")} alt="Neeks with a big batch of orders in the studio" loading="lazy" />
              <figcaption>
                <span>Studio day</span>
                <span>Bulk order</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="pad dark-2">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow reveal">On the reels</span>
              <h2 className="reveal d1" style={{ marginTop: "14px" }}>
                Watch it{" "}
                <span className="script" style={{ textTransform: "none" }}>get made</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" className="btn btn-ghost">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
                </svg>
                {" "}
                <span>Instagram</span>
              </a>
              {" "}
              <a href="https://www.tiktok.com/@neeksxart" target="_blank" rel="noopener" className="btn btn-ghost">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.5a7.9 7.9 0 0 0 4.4 1.3V6.5a4.5 4.5 0 0 1-4.4-4.5z"></path>
                </svg>
                {" "}
                <span>TikTok</span>
              </a>
            </div>
          </div>
          <div className="reels">
            <div className="reel">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/keys-reel.jpg")}>
                <source src={media("video/keys-reel.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Keychains</small>
                Nobody throws away their keys.
              </div>
            </div>
            <div className="reel">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/mirror-flip.jpg")}>
                <source src={media("video/mirror-flip.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Mirror keychains</small>
                Wait for the flip…
              </div>
            </div>
            <div className="reel">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/press-bw.jpg")}>
                <source src={media("video/press-bw.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Buttons</small>
                300 of 600 for Endless Ink Reno
              </div>
            </div>
            <div className="reel">
              <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/wedding-reel.jpg")}>
                <source src={media("video/wedding-reel.mp4")} type="video/mp4" />
              </video>
              <div className="reel-cap">
                <small>Events</small>
                Wedding favors, boxed & ready
              </div>
            </div>
          </div>
          <div className="reel reveal" style={{ aspectRatio: "16/9", maxWidth: "900px", margin: "40px auto 0", borderRadius: "26px" }}>
            <video data-autoplay="" muted loop playsInline preload="none" poster={media("video/mirror-make.jpg")}>
              <source src={media("video/mirror-make.mp4")} type="video/mp4" />
            </video>
            <div className="reel-cap">
              <small>Pocket mirrors</small>
              Pressing custom mirrors, start to finish
            </div>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>
                Your brand{" "}
                <span className="script" style={{ textTransform: "none" }}>is next.</span>
              </h2>
              <p>Upload your logo, preview it on any product and send it over for a free mockup.</p>
            </div>
            <div className="ctas">
              <Link href="/studio" className="btn btn-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4M7 9l5-5 5 5"></path>
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                </svg>
                {" "}Open the Merch Studio
              </Link>
              {" "}
              <Link href="/contact" className="btn btn-ghost" style={{ color: "#fff" }}>
                <span>Ask a question</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
