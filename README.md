# NeeksxArt LLC website

Custom merch studio site for **NeeksxArt LLC** (Reno, NV): custom keychains, mirror keychains, magnets, buttons and Tap-to-Connect NFC keychains.
Built by [Nexora Digital](https://www.nexoradigital.live).

**Stack:** Next.js 15 (App Router) on Vercel · Supabase (Storage for every photo, Postgres for orders & inquiries) · Gmail SMTP (nodemailer) for email notifications.

## Pages
| Route | What it is |
|---|---|
| `/` | Home: hero, product lineup, 3-step ordering, studio teaser, recent work, reels |
| `/magnets` | Standard Custom Magnets with tier pricing |
| `/catalog` | All 11 products with photos, from-prices and quantity tiers |
| `/pricing` | Live estimator + full price sheet + NeeksxArt Live bundle prices |
| `/favors` | Events & Party Favors + event quote form |
| `/policy` | Custom Orders, Live Magnets & Returns Policy |
| `/studio` | **Merch Studio**: upload a logo and preview it live on every product, download a PNG, send it as a quote request |
| `/work` | Filterable portfolio + process reels |
| `/story` | About Us (`/about` redirects here) |
| `/events` | NeeksxArt Live: how pop-ups work, bundle packs, QR to try it |
| `/event?e=<event-name>` | Guest ordering from the booth QR: pick a pack, upload & crop photos, get an order # ticket with **live status** |
| `/booth` | Staff tool (noindex): print/download the booth QR poster |
| `/contact` | Contact / bulk-order form (auto-attaches the Merch Studio mockup) + FAQ |
| `/admin` | **Staff dashboard** (password): live pop-up order board + website inquiries |

Old Shopify URLs (`/pages/...`, `/collections/...`, `/products/...`) and old `.html` URLs redirect to the new pages (`next.config.mjs`).

## Where things live
```
app/(site)/…        public pages (shared header/footer)       app/api/contact         contact + quote forms
app/(live)/event    phone-first pop-up ordering page          app/api/event-order/*   pop-up orders (prepare → upload → confirm → status)
app/(admin)/admin   staff dashboard                           lib/catalog.js          ALL products, prices, photos
components/         Header, Footer, catalog + pop-up parts    lib/bundles.js          pop-up packs, prices, ready time
lib/legacy/         Merch Studio, pop-up cropper, booth QR    supabase/schema.sql     database tables + storage buckets
styles/             site CSS                                  supabase/seed-media/    original photos/videos (uploaded to Supabase)
```

### How photos are stored (Supabase Storage)
| Bucket | Public? | What's in it |
|---|---|---|
| `site-media` | public | every photo & video on the site (`img/`, `video/`, `catalog/` product photos) |
| `customer-uploads` | private | logos + Merch Studio mockups sent through the contact form |
| `event-photos` | private | guest photos from live pop-ups (`<event>/<order #>/01.jpg …` + `overview.jpg`) |

Pages reference site photos with `media('img/neeks-studio.jpg')`. Guests' pop-up photos upload **straight from their phone to Supabase** using one-time signed links, so big packs never hit Vercel's 4.5 MB request limit. Private files are only shown in `/admin` through short-lived signed links.

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: paste `supabase/schema.sql` and run it (creates every table and the 3 buckets).
   Already set up before November 2026? Run `supabase/updates-nov-2026.sql` once instead (adds `site_settings`, `reviews`, `product_photos`).
3. **Project Settings → API**: copy the Project URL, `anon` key and `service_role` key.

### 2. Local
```bash
npm install
cp .env.example .env.local      # fill in the Supabase keys + ADMIN_PASSWORD
npm run media:upload            # copies all site photos/videos + Shopify product photos into Supabase
npm run dev                     # http://localhost:3000
```
`media:upload` is safe to re-run; it skips files already there (`npm run media:upload:force` re-uploads).
To add a photo later: put it in `supabase/seed-media/img/`, run `npm run media:upload`, use `media('img/<file>')`.

### 3. Vercel
1. Add the same variables from `.env.local` in **Vercel → Project → Settings → Environment Variables**.
2. Push to GitHub. `vercel.json` tells Vercel this is a Next.js project (the old project was set to "Other").

### Environment variables
| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | photos, pop-up uploads |
| `SUPABASE_SERVICE_ROLE_KEY` | saving orders/inquiries, dashboard (server only) |
| `ADMIN_PASSWORD` | `/admin` login |
| `NEXT_PUBLIC_SITE_URL` | links in emails, SEO (default `https://neeksxart.com`) |
| `SMTP_USER`, `SMTP_PASS`, `OWNER_EMAIL` | Gmail SMTP: the sending Gmail address, its 16-letter App password, and the inbox that receives orders/inquiries |
| `EVENT_TO_EMAIL`, `EVENT_EMAILS=off`, `EVENT_REQUIRE_LIVE=1` | pop-up email options; `EVENT_REQUIRE_LIVE=1` turns off demo mode |
| `POPUP_ALWAYS_OPEN=1` | keeps `/event` open without starting a pop-up (testing only) |
| `NEXT_PUBLIC_YELP_URL` | the NeeksxArt Yelp page, for the "See us on Yelp" buttons |

### Pop-up order emails
Every pop-up order is emailed to `OWNER_EMAIL` (or `EVENT_TO_EMAIL`) from the Gmail account: order #, event, pack, price, the guest's name/phone/email/notes, the overview sheet inline, and **every cropped photo attached** (900×900 JPG, numbered in pack order, e.g. `NX-482K-01-magnet.jpg`). Replying goes straight to the guest.

- With Supabase connected, photos are saved to Storage + the `/admin` board **and** emailed.
- Without Supabase but with Gmail set up, photos go straight into the email (nothing is stored).
- With neither, the flow runs in **demo mode** (order accepted, nothing sent) so it can still be shown to clients.

**Gmail App password:** turn on 2-Step Verification for the Gmail account, then go to myaccount.google.com/apppasswords, create one called "NeeksxArt website" and paste the 16 letters into `SMTP_PASS`. Gmail allows about 500 emails a day, plenty for pop-ups.

## Running a pop-up
Live ordering (`/event`) is **closed unless a pop-up is running**. Guests who scan an old QR code see a "Live ordering is closed" page.
0. `/admin` → **Start pop-up** (event name + how many hours). It closes itself at the end time, or tap **End pop-up**. While closed, staff logged in to `/admin` can still open `/event` as a preview.
1. `/booth` → type the event name → print the poster (or show it on a tablet).
2. Guests scan, pick a pack, upload photos, get an order number.
3. Open `/admin` on the press laptop: orders appear oldest-first (auto-refresh every 15 s) with numbered print files. Tap **Mark pressing now → Mark ready for pickup → Mark picked up**; the guest's ticket updates live.

## Editing products & prices
- `lib/catalog.js`: products, price tiers, pack prices, photos (catalog, magnets, pricing and estimator pages all render from it).
- `lib/bundles.js`: pop-up packs, piece counts, shapes, prices and the 10–15 min ready time. It's the only place live packs are defined; the home, events and `/event` pages all read from it.
- The "From $X" starting prices on the site are the single-piece price (first tier) of each product in `lib/catalog.js`.

## Product photos (4 per product)
Dashboard → **Product photos** (`/admin/products`): every product shows exactly 4 photos. Tap **Replace** on any slot to upload a new one (JPG/PNG/WebP; it's resized automatically), or **Reset** to go back to the built-in photo. The shop updates right away. Photo 1 is the main one.

## Reviews
- `/reviews` shows website reviews and Yelp reviews; the home page shows the latest 6.
- **Website reviews:** anyone can leave one (no account). They arrive as *pending* and are emailed to `OWNER_EMAIL`; approve, hide or delete them in Dashboard → **Reviews**.
- **Yelp reviews:** Yelp's API costs money and only returns 3 short excerpts, so instead: open the review on Yelp → **Share review → Embed review**, copy the code, and paste it into Dashboard → Reviews → *Add a Yelp review*. It appears as Yelp's own official review card.

## Branding
Logos are in `public/brand/` (`neeksxart-logo-black.png` on light backgrounds, `neeksxart-logo-white.png` on dark). The palette is white, black and mustard `#E1AD01`; colors are set at the top of `styles/style.css` (`--mustard`, plus `--accent-text` for readable mustard text on white).

## Print templates

Every print sheet is built on the client's **own press templates**, used exactly as they are:
`Template/2.25in Keychains Latest.png` (MPRO Round 2.25", 12 per sheet, NeeksxArt rim, MPRO strip on the right) and
`Template/2.5_ S MAGS latest.png` (2.5" magnets, 6 per sheet, flap text). The blank template goes down first and each
photo is drawn on top, clipped to that template's exact window (measured from the file: keychain window 2.251",
cut 2.625"; magnet square ≈2.55", octagon 3.345"). Unused spots are left blank. Nothing else is printed on the
sheet — the order number is in the file name.

Staff dashboard → **Templates** (`/admin/templates`, login required) has the blank sheets (PDF exactly 8.5 × 11 in +
PNG) and single-piece artboards. Print with the same settings you use for the original template (100% / Actual size).

When a template changes: replace the file in `Template/`, run `python3 scripts/build-print-templates.py`
(needs Pillow, numpy, scipy, reportlab). It re-measures every window into `lib/print-frames.js` and rebuilds the
blank sheets in `print-templates/` — downloads, order sheets and the Sheet maker all follow.

**Sheet maker (bulk):** Templates → *Sheet maker* — pick keychain or magnet, select/drop any number of photos at once
and they fill the slots in order, spilling onto extra sheets. Drag a tile to reposition, slider to zoom, ←/→ to reorder,
"Copies of each" and "Repeat to fill the last sheet" for logos or multiples, then **Download PDF** (one file, all sheets).
Runs entirely in the browser (`components/admin/SheetMaker.jsx` + `lib/print-sheet-core.js`) on the same templates — nothing is uploaded,
so there's no size limit.

**Customer images on the templates:** every pop-up order card has **Download print sheet** — a PDF with all of
that order's photos placed on the magnet / keychain templates in order (#1 top-left, then across; a 9-pack
spills onto a second sheet). Inquiries with an uploaded logo get **Logo on keychain sheet** and **Logo on magnet
sheet**, which fill a whole sheet with the logo inside the safe area. Built by `lib/print-sheet.js`
(route `/api/admin/print-sheet`). JPEG photos are embedded untouched; PNG/WebP/SVG logos go through `sharp`.

## Online checkout (demo payments → Square)

Customers can **Add to cart** on the catalog and the price estimator, then check out at `/checkout`:

1. **Products** are priced by the same tiers as the price sheet (`lib/catalog.js`).
2. **Fulfillment:** free local delivery to Reno/Sparks ZIP codes (if weather or an emergency stops delivery, the order ships instead) · $8 flat-rate shipping under $150 · free shipping on out-of-state orders over $150 (merchandise subtotal before tax; Alaska and Hawaii excluded).
3. **Sales tax** on products only, by ZIP (Washoe 8.265%, Carson City 7.6%, other NV 6.85%, out of state 0%).
4. **Payment:** orders $150+ can pay a 50% deposit; the balance is collected from the dashboard.

Every number is in `lib/checkout.js` — edit it there and the checkout, the server and the dashboard all follow.
The server re-prices every order, so a customer can't change prices in their browser.

**Dashboard → Payments** (`/admin/payments`) lists each order with the full money breakdown (products, delivery and
exactly how it was calculated, tax, total, collected, balance due, Square fee, net), transactions, and buttons to move
the order along, collect a deposit balance or refund. "Delete demo orders" clears test orders before a client demo.

**Demo mode (now):** `PAYMENTS_MODE` unset or `demo` → any card number is accepted and nothing is charged; orders and
the dashboard are marked *Demo*. Run `supabase/shop-orders.sql` once in Supabase → SQL Editor so orders are saved
(until then they're kept in server memory on `npm run dev`).

**Going live with Square:** create an app in the Square Developer Dashboard, set `PAYMENTS_MODE=square`,
`SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENV` (`sandbox` first, then `production`),
`NEXT_PUBLIC_SQUARE_APP_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, then swap the demo card inputs in
`components/shop/Checkout.jsx` for Square's Web Payments SDK card field (`card.tokenize()` → `payment.sourceId`).
`lib/payments.js` already has the Square Payments API call. Confirm tax rates before going live.

## Socials
[Instagram](https://www.instagram.com/neeksxart/) · [Facebook](https://www.facebook.com/NEEKSxART/) · [TikTok](https://www.tiktok.com/@neeksxart)
