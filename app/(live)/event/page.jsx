import Link from 'next/link';
import { media } from '@/lib/media';
import LegacyMount from '@/components/LegacyMount';

export const metadata = {
  title: "NeeksxArt Live Pop-Up | Upload Your Photos",
  description: "Pick a bundle pack, upload your photos, and pick up your custom merch at the NeeksxArt booth in 10–15 minutes.",
  openGraph: { title: "NeeksxArt Live Pop-Up | Upload Your Photos", description: "Pick a bundle pack, upload your photos, and pick up your custom merch at the NeeksxArt booth in 10–15 minutes.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/event' },
};

export default function EventPage() {
  return (
    <div className="ev-shell">
      <div className="ev-app">
        <header className="ev-top">
          <Link href="/" className="ev-logo" aria-label="NeeksxArt home">
            <img src={media("img/logo-white.png")} alt="NeeksxArt" width="768" height="551" />
          </Link>
          {" "}
          <span className="ev-live">
            <i></i>
            {" "}Live pop-up
          </span>
        </header>
        <div id="orderView">
          <section className="ev-hero">
            <p className="ev-event" id="eventName">Pop-Up</p>
            <h1 className="display">
              Your photos.{" "}
              <span className="script">pressed</span>
              {" "}while you wait.
            </h1>
            <div className="ev-timer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"></path>
              </svg>
              {" "}Ready in{" "}
              <b id="readyRange">10–15 min</b>
            </div>
          </section>
          <section className="ev-step" id="step1">
            <h2>
              <b>1</b>
              {" "}Pick your pack
            </h2>
            <div className="bundles" id="bundleList" role="radiogroup" aria-label="Bundle packs"></div>
          </section>
          <section className="ev-step" id="step2">
            <h2>
              <b>2</b>
              {" "}Add your photos
            </h2>
            <p className="ev-sub" id="slotHint">Tap a spot to add a photo, or add them all at once.</p>
            <label className="btn btn-orange ev-add">
              <input type="file" id="multiInput" accept="image/*" multiple hidden />
              {" "}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4M7 9l5-5 5 5"></path>
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
              </svg>
              {" "}
              <span id="addLabel">Add photos</span>
            </label>
            <div className="slots" id="slots"></div>
            <div className="ev-progress">
              <div className="bar">
                <i id="progBar"></i>
              </div>
              <span id="progText">0 of 9 added</span>
            </div>
            <button type="button" className="ev-repeat" id="repeatBtn" hidden>Fill the empty spots by repeating my photos</button>
          </section>
          <section className="ev-step" id="step3">
            <h2>
              <b>3</b>
              {" "}Who's it for?
            </h2>
            <form id="detailsForm" noValidate>
              <div className="field">
                <label htmlFor="evName">
                  First name{" "}
                  <em>*</em>
                </label>
                <input id="evName" autoComplete="given-name" required placeholder="So we can call your name" />
              </div>
              <div className="field">
                <label htmlFor="evPhone">
                  Phone{" "}
                  <em className="opt">optional</em>
                </label>
                <input id="evPhone" type="tel" autoComplete="tel" inputMode="tel" placeholder="In case we need to reach you" />
              </div>
              <div className="field">
                <label htmlFor="evEmail">
                  Email{" "}
                  <em className="opt">optional</em>
                </label>
                <input id="evEmail" type="email" autoComplete="email" placeholder={"For your receipt & future drops"} />
              </div>
              <div className="field">
                <label htmlFor="evNote">
                  Notes for Neeks{" "}
                  <em className="opt">optional</em>
                </label>
                <input id="evNote" maxLength="140" placeholder={"e.g. black & white for photo 3"} />
              </div>
            </form>
          </section>
          <div className="ev-bar">
            <div className="ev-bar-info">
              <strong id="barBundle">The Nine Pack</strong>
              <span id="barPrice">Pay at the booth</span>
            </div>
            <button type="button" className="btn btn-orange" id="submitBtn" disabled>Send to the press</button>
          </div>
        </div>
        <div id="ticketView" hidden>
          <section className="ticket">
            <div className="ticket-head">
              <span className="ev-live">
                <i></i>
                {" "}Order received
              </span>
              <p>Your order number</p>
              <div className="ticket-num" id="tNum">NX-000</div>
              <p className="ticket-ready">
                Ready around{" "}
                <b id="tTime">--:--</b>
              </p>
            </div>
            <div className="ticket-body">
              <img id="tSheet" alt="Your photos" />
              <dl>
                <dt>Name</dt>
                <dd id="tName"></dd>
                <dt>Pack</dt>
                <dd id="tBundle"></dd>
                <dt>Event</dt>
                <dd id="tEvent"></dd>
                <dt>Pay</dt>
                <dd id="tPrice"></dd>
                <dt>Status</dt>
                <dd id="tStatus" className="t-status">Received</dd>
              </dl>
              <p className="ticket-note">
                Show this screen at the NeeksxArt booth. We'll call your name and number when your pack comes off the press.
              </p>
              <p className="ticket-demo" id="tDemo" hidden>Demo mode: this order wasn't saved because the site isn't connected to Supabase yet.</p>
            </div>
          </section>
          <div className="ticket-actions">
            <a className="btn btn-ghost" href="https://www.instagram.com/neeksxart/" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle>
              </svg>
              {" "}
              <span>Tag @neeksxart</span>
            </a>
            {" "}
            <button type="button" className="btn btn-orange" id="newOrderBtn">Start another order</button>
          </div>
        </div>
      </div>
      <div className="editor" id="editor" hidden role="dialog" aria-modal="true" aria-label="Adjust photo">
        <div className="editor-card">
          <p className="editor-title" id="editorTitle">Photo 1</p>
          <div className="editor-stage">
            <canvas id="editCanvas" width="700" height="700"></canvas>
          </div>
          <p className="editor-hint">Drag to move · slide to zoom</p>
          <input type="range" id="editZoom" min="100" max="300" defaultValue="100" aria-label="Zoom" />
          <div className="editor-btns">
            <label className="mini">
              Replace
              <input type="file" id="replaceInput" accept="image/*" hidden />
            </label>
            {" "}
            <button type="button" className="mini danger" id="removeBtn">Remove</button>
            {" "}
            <button type="button" className="btn btn-orange" id="doneBtn">Done</button>
          </div>
        </div>
      </div>
      <LegacyMount module="event" />
    </div>
  );
}
