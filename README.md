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
2. **SQL Editor → New query**: paste `supabase/schema.sql` and run it (creates the `inquiries` + `event_orders` tables and the 3 buckets).
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

### Pop-up order emails
Every pop-up order is emailed to `OWNER_EMAIL` (or `EVENT_TO_EMAIL`) from the Gmail account: order #, event, pack, price, the guest's name/phone/email/notes, the overview sheet inline, and **every cropped photo attached** (900×900 JPG, numbered in pack order, e.g. `NX-482K-01-magnet.jpg`). Replying goes straight to the guest.

- With Supabase connected, photos are saved to Storage + the `/admin` board **and** emailed.
- Without Supabase but with Gmail set up, photos go straight into the email (nothing is stored).
- With neither, the flow runs in **demo mode** (order accepted, nothing sent) so it can still be shown to clients.

**Gmail App password:** turn on 2-Step Verification for the Gmail account, then go to myaccount.google.com/apppasswords, create one called "NeeksxArt website" and paste the 16 letters into `SMTP_PASS`. Gmail allows about 500 emails a day, plenty for pop-ups.

## Running a pop-up
1. `/booth` → type the event name → print the poster (or show it on a tablet).
2. Guests scan, pick a pack, upload photos, get an order number.
3. Open `/admin` on the press laptop: orders appear oldest-first (auto-refresh every 15 s) with numbered print files. Tap **Mark pressing now → Mark ready for pickup → Mark picked up**; the guest's ticket updates live.

## Editing products & prices
- `lib/catalog.js`: products, price tiers, pack prices, photos (catalog, magnets, pricing and estimator pages all render from it).
- `lib/bundles.js`: pop-up packs, piece counts, shapes, prices and the 10–15 min ready time.

## Print templates

Staff dashboard → **Templates** (`/admin/templates`, login required) has blank, exact-size press sheets to download:

| Template | Sheet | Cut | Face | Safe |
|---|---|---|---|---|
| 2.25" round keychain / button | 12-up, Letter | 2.625" circle | 2.25" | 1.875" |
| 2.5" square magnet (with or without NeeksxArt flap text) | 6-up, Letter | 3.333" octagon | 2.5" (art 2.54") | 2.25" |

The keychain uses the NeeksxArt rim design from `Template/2.25in Keychains Latest.png` (black ring + gold lettering between the 2.25" photo window and the 2.625" cut); the script cuts it out into `print-templates/keychain-ring-2.625in.png`, which order print sheets also lay over each photo.

Each comes as a vector PDF (exactly 8.5 × 11 in), a 300 DPI PNG (2550 × 3300 px), an editable SVG, plus a single-piece artboard.
Print at **100% / Actual size** — every sheet has a 1-inch check bar in the margin.

Files live in `print-templates/`. To change sizes or add a product, edit `scripts/build-print-templates.py`,
run `python3 scripts/build-print-templates.py` (needs `rsvg-convert` + Pillow), and list the files in `lib/print-templates.js`.
The original filled samples are in `Template/`; the current designs are `2.25in Keychains Latest.png` and `2.5_ S MAGS latest.png` (magnet flap text: Helvetica/Arial Bold 8 pt hugging the art square).

**Sheet maker (bulk):** Templates → *Sheet maker* — pick keychain or magnet, select/drop any number of photos at once
and they fill the slots in order, spilling onto extra sheets. Drag a tile to reposition, slider to zoom, ←/→ to reorder,
"Copies of each" and "Repeat to fill the last sheet" for logos or multiples, then **Download PDF** (one file, all sheets).
Runs entirely in the browser (`components/admin/SheetMaker.jsx` + `lib/print-sheet-core.js`) — nothing is uploaded,
so there's no size limit.

**Customer images on the templates:** every pop-up order card has **Download print sheet** — a PDF with all of
that order's photos already placed on the magnet / keychain sheets (numbered #1, #2… like the board; a 9-pack
spills onto a second sheet). Inquiries with an uploaded logo get **Logo on keychain sheet** and **Logo on magnet
sheet**, which fill a whole sheet with the logo inside the safe area. Built by `lib/print-sheet.js`
(route `/api/admin/print-sheet`). JPEG photos are embedded untouched; PNG/WebP/SVG logos go through `sharp`.

## Online checkout (demo payments → Square)

Customers can **Add to cart** on the catalog and the price estimator, then check out at `/checkout`:

1. **Products** are priced by the same tiers as the price sheet (`lib/catalog.js`).
2. **Fulfillment:** free local pickup in Reno · local delivery by ZIP zone (Zone A Reno/Sparks $7.99, Zone B greater Reno $14.99, free on $150+) · USPS shipping by package weight (free standard shipping on $200+, Priority +$6).
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
`lib/payments.js` already has the Square Payments API call. Confirm tax rates and delivery prices before going live.

## Socials
[Instagram](https://www.instagram.com/neeksxart/) · [Facebook](https://www.facebook.com/NEEKSxART/) · [TikTok](https://www.tiktok.com/@neeksxart)
