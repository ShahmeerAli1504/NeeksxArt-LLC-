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

## Socials
[Instagram](https://www.instagram.com/neeksxart/) · [Facebook](https://www.facebook.com/NEEKSxART/) · [TikTok](https://www.tiktok.com/@neeksxart)
