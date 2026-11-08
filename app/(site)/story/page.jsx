import Link from 'next/link';
import { media } from '@/lib/media';

export const metadata = {
  title: "About Us | NeeksxArt LLC — Reno, NV",
  description: "The story behind NeeksxArt: a Reno studio hand-pressing merch people actually keep.",
  openGraph: { title: "About Us | NeeksxArt LLC — Reno, NV", description: "The story behind NeeksxArt: a Reno studio hand-pressing merch people actually keep.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/story' },
};

export default function StoryPage() {
  return (
    <>
      <section className="page-hero dark grain">
        <div className="wrap story-split">
          <div>
            <span className="eyebrow reveal">About NeeksxArt</span>
            <h1 className="display reveal d1">
              Art you can{" "}
              <span className="script">carry.</span>
            </h1>
            <p className="lead reveal d2">
              A Reno-based novelty shop owned and run by Neeks, made side by side with his fiancée Crystal. One press, and a belief that merch should be something people want to keep.
            </p>
          </div>
          <div className="story-photo reveal d2">
            <img src={media("img/neeks-5k.jpg")} alt="Neeks, founder of NeeksxArt, holding a custom keychain" style={{ objectPosition: "50% 30%" }} />
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(30px,6vw,90px)", alignItems: "start" }}>
          <div>
            <span className="eyebrow reveal">How it started</span>
            <h2 className="reveal d1" style={{ margin: "14px 0 26px" }}>
              From an idea{" "}
              <span className="script" style={{ textTransform: "none" }}>to a press</span>
            </h2>
          </div>
          <div className="prose reveal d2">
            <p>
              NeeksxArt started with an artist and a simple question.{" "}
              <strong>Why does most promo merch end up in the trash?</strong>
            </p>
            <p>
              Pens run dry. Stickers peel. Tote bags pile up in closets. Meanwhile, the one thing everybody carries every single day is their keys. So Neeks built a lineup around the things people actually hold onto: keychains, pocket mirrors, fridge magnets, buttons, and smart tap-to-connect keychains that open a business's page with one tap of a phone.
            </p>
            <p>
              Every piece is printed, pressed and packed by hand right here in Reno, "The Biggest Little City." Small batch or bulk run, each order gets the same attention to detail, from a free logo mockup to custom backer cards that make the merch feel like a gift.
            </p>
            <p>
              Today NeeksxArt makes merch for tattoo shops, car audio crews, hair stylists and lash artists, DJs, coffee spots, nonprofits, schools, weddings and birthday parties, and a community of more than{" "}
              <strong>5,000 followers</strong>
              {" "}who show up for every drop.
            </p>
          </div>
        </div>
      </section>
      <section className="pad paper-2">
        <div className="wrap">
          <span className="eyebrow reveal">The people behind NeeksxArt</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 40px" }}>
            Small business.{" "}
            <span className="script" style={{ textTransform: "none" }}>Personal touch.</span>
          </h2>
          <div className="people">
            <div className="person reveal">
              <span className="role">Founder & owner</span>
              <h3>Nicko Marciano</h3>
              <p>
                Known to everyone as{" "}
                <strong>Neeks</strong>
                . Nicko founded NeeksxArt LLC and leads the designs, the press and every customer relationship, from a single magnet to a run of hundreds.
              </p>
            </div>
            <div className="person reveal d1">
              <span className="role">Design, press & shipping</span>
              <h3>Crystal Matutis</h3>
              <p>
                Nicko's fiancée. Crystal designs, presses and ships right alongside Neeks, and she's a big part of the brand, down to the packaging that makes every order feel like a gift.
              </p>
            </div>
          </div>
          <div className="prose reveal d2" style={{ maxWidth: "760px", marginTop: "40px" }}>
            <p>
              Neeks X Art LLC is a Reno-based novelty shop owned and run by Neeks. We turn business logos and personal photos into fridge-worthy magnets, key chains, pocket mirrors, and buttons — because a business card gets forgotten, but your logo on a fridge gets seen every day. My fiancée, Crystal, is right there with me — she designs, presses, and ships alongside me. It&apos;s my name on the shop, but we&apos;re a collaboration as one.
            </p>
            <p>
              There&apos;s{" "}
              <strong>no minimum order</strong>
              , so you can order one piece or hundreds.
            </p>
            <p className="script" style={{ fontSize: "2rem", color: "var(--accent-text)" }}>Because the best merch isn't just seen. It's carried, used, shared and remembered.</p>
          </div>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <span className="eyebrow reveal">What we stand for</span>
          <h2 className="reveal d1" style={{ margin: "14px 0 46px" }}>
            The NeeksxArt{" "}
            <span className="script" style={{ textTransform: "none" }}>way</span>
          </h2>
          <div className="values">
            <div className="value reveal">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"></path>
                </svg>
              </div>
              <h3>Merch with a purpose</h3>
              <p>
                If it isn't useful or meaningful, it gets tossed. We make things people check their lashes in, hang their keys on and stick on the fridge for years.
              </p>
            </div>
            <div className="value reveal d1">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6 6 0 0 1 5 18.4l-2.4-4a1.5 1.5 0 0 1 2.5-1.6L8 15"></path>
                </svg>
              </div>
              <h3>Handmade, every time</h3>
              <p>
                No anonymous factory floor. Each keychain, mirror, magnet and button is hand-pressed and checked before it ships.
              </p>
            </div>
            <div className="value reveal d2">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"></path>
                  <circle cx="12" cy="10" r="2.5"></circle>
                </svg>
              </div>
              <h3>Keep Reno rad</h3>
              <p>
                We're proud to grow alongside the independent businesses, creators and causes of the Reno-Tahoe community, and we ship nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="pad dark grain">
        <div className="wrap story-split">
          <div className="reveal">
            <div className="big-num">5K</div>
            <p className="script" style={{ fontSize: "2.4rem", marginTop: "-6px" }}>and counting</p>
          </div>
          <div>
            <p className="quote reveal d1" style={{ color: "var(--paper)" }}>
              I seriously appreciate everyone who has supported NeeksxArt, especially the local businesses, creators, nonprofits, and community that have trusted me with their merch.
            </p>
            <p className="sig reveal d2">— Neeks</p>
            <div className="hero-ctas reveal d3" style={{ marginTop: "30px" }}>
              <a href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener" className="btn btn-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                  <circle cx="12" cy="12" r="4"></circle>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
                </svg>
                {" "}Follow @neeksxart
              </a>
              {" "}
              <Link href="/studio" className="btn btn-ghost">
                <span>Design your merch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
