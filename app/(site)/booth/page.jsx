import { media } from '@/lib/media';
import { PosterPacks } from '@/components/popup/BundleCards';
import LegacyMount from '@/components/LegacyMount';

export const metadata = {
  title: "Booth QR Poster | NeeksxArt Live",
  description: "Generate the QR code poster for a NeeksxArt pop-up booth.",
  robots: { index: false, follow: false },
  openGraph: { title: "Booth QR Poster | NeeksxArt Live", description: "Generate the QR code poster for a NeeksxArt pop-up booth.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/booth' },
};

export default function BoothPage() {
  return (
    <div className="booth-shell">
      <section className="page-hero dark grain no-print" style={{ paddingBottom: "50px" }}>
        <div className="wrap">
          <span className="eyebrow">Staff tool · Booth setup</span>
          <h1 className="display" style={{ fontSize: "clamp(2.8rem,7vw,5.4rem)" }}>
            Booth{" "}
            <span className="script">QR poster</span>
          </h1>
          <p className="lead">
            Name the event, then print this poster or put it on a tablet at the booth. Guests scan it to open the ordering page tagged with your event, and every order email shows which event it came from.
          </p>
        </div>
      </section>
      <section className="pad booth" style={{ paddingTop: "50px" }}>
        <div className="wrap booth-grid">
          <div className="booth-controls no-print">
            <div className="field">
              <label htmlFor="boothEvent">Event name</label>
              <input id="boothEvent" defaultValue="Reno Pop-Up" maxLength="40" />
            </div>
            <div className="field">
              <label htmlFor="boothHeadline">Poster headline</label>
              <input id="boothHeadline" defaultValue="Your photos, pressed while you wait" maxLength="60" />
            </div>
            <div className="field">
              <label>Guest link</label>
              <div className="booth-link">
                <code id="boothLink"></code>
                <button type="button" id="copyLink">Copy</button>
              </div>
            </div>
            <div className="booth-btns">
              <button type="button" className="btn btn-orange" id="printBtn">Print poster</button>
              {" "}
              <button type="button" className="btn btn-ink" id="dlQr">Download QR (PNG)</button>
              {" "}
              <a className="btn btn-ghost" id="openGuest" target="_blank" rel="noopener">
                <span>Open guest page</span>
              </a>
            </div>
            <p className="fine-dark">Tip: test-scan the printed poster with your own phone before the doors open.</p>
          </div>
          <div className="poster" id="poster">
            <img className="poster-logo" src={media("img/logo-white.png")} alt="NeeksxArt" />
            <p className="poster-live">
              <i></i>
              {" "}Live custom merch
            </p>
            <h2 className="poster-head" id="posterHead">Your photos, pressed while you wait</h2>
            <div className="poster-qr" id="posterQr"></div>
            <div className="poster-steps">
              <div>
                <b>1</b>
                Scan
              </div>
              <div>
                <b>2</b>
                Upload
              </div>
              <div>
                <b>3</b>
                Pick up in 10–15 min
              </div>
            </div>
            <PosterPacks className="poster-packs" id="posterPacks" />
            <p className="poster-foot">
              <span id="posterEvent">Reno Pop-Up</span>
              {" "}· @neeksxart
            </p>
          </div>
        </div>
      </section>
      <LegacyMount module="booth" />
    </div>
  );
}
