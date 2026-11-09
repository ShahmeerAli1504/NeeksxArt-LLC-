import { media } from '@/lib/media';
import PrintAsIs from '@/components/notes/PrintAsIs';
import LegacyMount from '@/components/LegacyMount';

export const metadata = {
  title: "Merch Studio | Design Your Custom Keychain, Magnet or Button — NeeksxArt",
  description: "Upload your logo and preview it live as a keychain, mirror keychain, magnet, button or tap-to-connect NFC keychain. Pick the size and hardware, download your preview and order.",
  openGraph: { title: "Merch Studio | Design Your Custom Keychain, Magnet or Button — NeeksxArt", description: "Upload your logo and preview it live as a keychain, mirror keychain, magnet, button or tap-to-connect NFC keychain. Pick the size and hardware, download your preview and order.", images: [media("img/neeks-studio.jpg")] },
  alternates: { canonical: '/studio' },
};

export default function StudioPage() {
  return (
    <>
      <section className="studio-top dark grain">
        <div className="wrap">
          <span className="eyebrow">The Merch Studio</span>
          <h1 className="display">
            Design it.{" "}
            <span className="script">see it.</span>
            {" "}Keep it.
          </h1>
          <p className="lead">
            Upload your logo, choose a product and dial in the details. Drag your art on the preview to position it, flip it to see the back, then download your preview and order.
          </p>
        </div>
      </section>
      <section className="studio dark">
        <div className="wrap studio-grid">
          <div className="stage-col">
            <div className="stage" id="stage">
              <canvas id="preview" width="1000" height="1000" aria-label="Live preview of your custom merch"></canvas>
              <div className="stage-hint" id="stageHint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6 6 0 0 1 5 18.4l-2.4-4a1.5 1.5 0 0 1 2.5-1.6L8 15"></path>
                </svg>
                {" "}Drag to move · scroll to zoom
              </div>
              <div className="stage-size" id="sizeReadout">2.25″ · 57 mm</div>
              <div className="stage-tools">
                <div className="seg" role="group" aria-label="View side">
                  <button type="button" className="on" data-side="front">Front</button>
                  {" "}
                  <button type="button" data-side="back">Back</button>
                </div>
                <div className="seg scenes" role="group" aria-label="Background scene">
                  <button type="button" className="on" data-scene="studio" title="Studio" aria-label="Dark studio scene" style={{ "--sw": "#1a1a1a" }}></button>
                  {" "}
                  <button type="button" data-scene="paper" title="White" aria-label="White scene" style={{ "--sw": "#ffffff" }}></button>
                  {" "}
                  <button type="button" data-scene="mustard" title="Mustard" aria-label="Mustard scene" style={{ "--sw": "#E1AD01" }}></button>
                </div>
                <button type="button" className="tool-btn" id="downloadBtn" title="Download mockup">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4M7 9l5-5 5 5"></path>
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                  </svg>
                  <span>Save PNG</span>
                </button>
              </div>
            </div>
            <p className="stage-note">
              Preview is a digital mockup for planning. Neeks sends a print-ready proof before anything is pressed.
            </p>
          </div>
          <form className="panel" id="studioForm">
            <fieldset className="group open" data-step="1">
              <legend>
                <b>01</b>
                {" "}Choose your product
              </legend>
              <div className="prod-grid" id="productGrid">
                <label>
                  <input type="radio" name="product" value="keychain" defaultChecked />
                  <span>
                    <i className="pi pi-key"></i>
                    Keychain
                    <small>Domed, ring + chain</small>
                  </span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="product" value="mirror" />
                  <span>
                    <i className="pi pi-mirror"></i>
                    Mirror Keychain
                    <small>Logo front, mirror back</small>
                  </span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="product" value="magnet" />
                  <span>
                    <i className="pi pi-magnet"></i>
                    Magnet
                    <small>Logo or photo</small>
                  </span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="product" value="button" />
                  <span>
                    <i className="pi pi-button"></i>
                    Button
                    <small>Pin-back</small>
                  </span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="product" value="pocket" />
                  <span>
                    <i className="pi pi-mirror"></i>
                    Pocket Mirror
                    <small>3″ purse-size mirror</small>
                  </span>
                </label>
                {" "}
                <label>
                  <input type="radio" name="product" value="nfc" />
                  <span>
                    <i className="pi pi-nfc"></i>
                    Tap-to-Connect
                    <small>NFC keychain: tap to open your link</small>
                  </span>
                </label>
                {" "}
                <label className="wide">
                  <input type="radio" name="product" value="nfcmirror" />
                  <span>
                    <i className="pi pi-nfc"></i>
                    Tap-to-Connect Mirror
                    <small>Mirror keychain with an NFC chip</small>
                  </span>
                </label>
              </div>
            </fieldset>
            <fieldset className="group" data-step="2">
              <legend>
                <b>02</b>
                {" "}Upload your artwork
              </legend>
              <label className="drop" id="drop">
                <input type="file" id="fileInput" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
                {" "}
                <span className="drop-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4M7 9l5-5 5 5"></path>
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path>
                  </svg>
                </span>
                {" "}
                <strong>Drop your logo here</strong>
                {" "}
                <small>or tap to browse · PNG, JPG, WEBP or SVG · transparent PNG looks best</small>
              </label>
              <PrintAsIs className="studio-print-note" />
              <div className="samples">
                <span>No logo handy?</span>
                {" "}
                <button type="button" data-sample="/brand/neeksxart-logo-white.png" data-bg="#0b0b0b">NeeksxArt logo</button>
                {" "}
                <button type="button" data-sample={media("img/neeks-5k.jpg")} data-bg="#3a2a1f">Photo sample</button>
              </div>
              <div className="ctrl">
                <label htmlFor="scale">
                  Art size{" "}
                  <output id="scaleOut">100%</output>
                </label>
                {" "}
                <input type="range" id="scale" min="20" max="250" defaultValue="100" />
              </div>
              <div className="ctrl">
                <label htmlFor="rotate">
                  Rotate{" "}
                  <output id="rotOut">0°</output>
                </label>
                {" "}
                <input type="range" id="rotate" min="-180" max="180" defaultValue="0" />
              </div>
              <div className="mini-btns">
                <button type="button" id="fitBtn">Fit</button>
                {" "}
                <button type="button" id="fillBtn">Fill edge-to-edge</button>
                {" "}
                <button type="button" id="centerBtn">Center</button>
                {" "}
                <button type="button" id="knockBtn" aria-pressed="false">Remove white background</button>
              </div>
              <div className="ctrl">
                <label>Background color</label>
                <div className="swatches" id="bgSwatches">
                  <button type="button" style={{ "--c": "#0b0b0b" }} data-c="#0b0b0b" className="on" aria-label="Black"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#ffffff" }} data-c="#ffffff" aria-label="White"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#f3eee6" }} data-c="#f3eee6" aria-label="Cream"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#E1AD01" }} data-c="#E1AD01" aria-label="Mustard"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#ff2d8a" }} data-c="#ff2d8a" aria-label="Hot pink"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#1f8f4e" }} data-c="#1f8f4e" aria-label="Green"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#1d4ed8" }} data-c="#1d4ed8" aria-label="Blue"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#c8a24a" }} data-c="#c8a24a" aria-label="Gold"></button>
                  {" "}
                  <label className="custom" aria-label="Custom color">
                    <input type="color" id="bgCustom" defaultValue="#6b21a8" />
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset className="group" data-step="3">
              <legend>
                <b>03</b>
                {" "}Add text{" "}
                <em>optional</em>
              </legend>
              <div className="ctrl">
                <input type="text" id="textLine" maxLength="40" placeholder="e.g. @yourbusiness or Est. 2026" />
              </div>
              <div className="row3">
                <div className="ctrl">
                  <label htmlFor="textFont">Style</label>
                  {" "}
                  <select id="textFont">
                    <option value="script">Script</option>
                    <option value="bold">Bold block</option>
                    <option value="clean">Clean</option>
                  </select>
                </div>
                <div className="ctrl">
                  <label htmlFor="textPos">Position</label>
                  {" "}
                  <select id="textPos">
                    <option value="arc-bottom">Curved bottom</option>
                    <option value="arc-top">Curved top</option>
                    <option value="bottom">Straight bottom</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div className="ctrl">
                  <label htmlFor="textColor">Color</label>
                  <input type="color" id="textColor" defaultValue="#ffffff" />
                </div>
              </div>
            </fieldset>
            <fieldset className="group" data-step="4">
              <legend>
                <b>04</b>
                {" "}Size & finish
              </legend>
              <div className="ctrl">
                <label>Size</label>
                <div className="chips" id="sizeChips"></div>
              </div>
              <div className="ctrl">
                <label>Finish</label>
                <p className="finish-readout" id="finishReadout">Standard glossy</p>
              </div>
              <p className="fine">These are the sizes we make. Buttons and keychains are standard glossy, mirror keychains are Sandy Mylar and pocket mirrors are cotton.</p>
            </fieldset>
            <fieldset className="group" data-step="5" id="hardwareGroup">
              <legend>
                <b>05</b>
                {" "}Hardware & tassel
              </legend>
              <div className="ctrl">
                <label>Ring & chain</label>
                <div className="chips" id="metalChips"></div>
                <p className="fine" id="metalNote" style={{ marginTop: "8px" }}></p>
              </div>
              <div className="ctrl">
                <label>Tassel</label>
                <div className="swatches" id="tasselSwatches">
                  <button type="button" data-c="none" className="on none" aria-label="No tassel">∅</button>
                  {" "}
                  <button type="button" style={{ "--c": "#ff4fa3" }} data-c="#ff4fa3" aria-label="Pink tassel"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#ffffff" }} data-c="#ffffff" aria-label="White tassel"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#111111" }} data-c="#111111" aria-label="Black tassel"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#c8a24a" }} data-c="#c8a24a" aria-label="Gold tassel"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#7c3aed" }} data-c="#7c3aed" aria-label="Purple tassel"></button>
                  {" "}
                  <button type="button" style={{ "--c": "#14b8a6" }} data-c="#14b8a6" aria-label="Teal tassel"></button>
                </div>
              </div>
            </fieldset>
            <fieldset className="group" data-step="6" id="nfcGroup">
              <legend>
                <b>06</b>
                {" "}Tap-to-Connect link
              </legend>
              <p className="fine" style={{ marginTop: 0 }}>We program the NFC chip so any modern phone opens this link with a tap. No app needed.</p>
              <div className="ctrl">
                <input type="url" id="nfcUrl" placeholder="https://instagram.com/yourbusiness" />
              </div>
              <div className="chips">
                <label>
                  <input type="checkbox" id="nfcIcon" defaultChecked />
                  <span>Show tap icon on the front</span>
                </label>
              </div>
            </fieldset>
            <fieldset className="group" data-step="7">
              <legend>
                <b id="pkgNum">07</b>
                {" "}Quantity
              </legend>
              <div className="ctrl">
                <label>Single or bundle pack</label>
                <div className="qp">
                  <div className="qp-chips" id="qtyChips"></div>
                  <div className="atc-qty qp-step" id="qtyStep">
                    <button type="button" data-qstep="-1" aria-label="Fewer">−</button>
                    <output id="qtyOut">1</output>
                    <button type="button" data-qstep="1" aria-label="More">+</button>
                    <small id="qtyMax"></small>
                  </div>
                </div>
                <p className="qty-price" id="qtyPrice" aria-live="polite"></p>
              </div>
              <div className="ctrl">
                <label htmlFor="needBy">
                  Need it by{" "}
                  <em>optional</em>
                </label>
                <input type="date" id="needBy" />
              </div>
              <p className="fine">
                No minimums: order singles, or save with a bundle pack. Need a quantity that isn&apos;t a bundle?{" "}
                <a id="qtyOther" href="mailto:info@neeksxart.com">Email</a> or DM us. Packaging is standard on every order.
              </p>
            </fieldset>
            <div className="summary" id="summary" aria-live="polite"></div>
            <p className="order-note" id="orderNote"></p>
            <div className="panel-actions">
              <button type="button" className="btn btn-orange" id="cartBtn">
                <span id="cartLabel">Add to cart</span>
              </button>
              <button type="button" className="btn btn-orange hidden" id="quoteBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12z"></path>
                </svg>
                {" "}Send my order request
              </button>
              {" "}
              <button type="button" className="btn btn-ghost" id="downloadBtn2">
                <span>Download preview</span>
              </button>
              <small className="atc-added hidden" id="cartAdded">Added ✓ <a href="/checkout">Go to checkout →</a></small>
            </div>
            <div className="help-card">
              <strong>Need help with your artwork?</strong>
              <p>
                We aren&apos;t graphic designers, but creative assistance is available for custom logos and artwork for a small fee of $40–$60, depending on the complexity. Email or DM us to inquire, or send this design over.
              </p>
              <button type="button" className="link-arrow" id="helpBtn">Ask about creative assistance</button>
            </div>
          </form>
        </div>
      </section>
      <section className="pad">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">What happens next</span>
              <h2 style={{ marginTop: "14px" }}>
                From preview to{" "}
                <span className="script" style={{ textTransform: "none" }}>your pocket</span>
              </h2>
            </div>
          </div>
          <div className="steps light-steps">
            <div className="step">
              <h3>Preview it</h3>
              <p>Upload your photo or logo, download the preview and add it to your cart. Special orders are sent to Neeks by email.</p>
            </div>
            <div className="step">
              <h3>Prints as uploaded</h3>
              <p>Your design prints exactly as you uploaded it, so use your best original file. Need artwork help? Ask about creative assistance.</p>
            </div>
            <div className="step">
              <h3>Hand-pressed</h3>
              <p>Every piece is printed, pressed and quality-checked in Reno.</p>
            </div>
            <div className="step">
              <h3>Packed & shipped</h3>
              <p>Free delivery in Reno &amp; Sparks, or $8 flat-rate shipping (free out of state on $150 and over).</p>
            </div>
          </div>
        </div>
      </section>
      <LegacyMount module="studio" />
    </>
  );
}
