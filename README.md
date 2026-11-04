# NeeksxArt LLC — Website

Custom merch studio site for **NeeksxArt LLC** (Reno, NV): custom keychains, mirror keychains, magnets, buttons and Tap-to-Connect NFC keychains.

Built by [Nexora Digital](https://www.nexoradigital.live).

## Pages
| Route | What it is |
|---|---|
| `/` | Home: hero, product lineup, studio teaser, recent work, reels, story teaser |
| `/studio` | **Merch Studio**: customers upload a logo and preview it live on every product (size, shape, finish, hardware, tassel, text, NFC link, packaging, quantity), flip to the back, download a PNG, and send it as a quote request |
| `/work` | Filterable portfolio + process reels |
| `/story` | Brand story and values |
| `/contact` | Contact / bulk-order form (auto-attaches the Merch Studio mockup) + FAQ |

Product deep links: `/studio?product=keychain|mirror|magnet|button|nfc`

## Stack
Plain HTML/CSS/JS (no build step) + one Vercel serverless function (`api/contact.js`).

## Deploy on Vercel
1. Import this repo in Vercel (Framework preset: **Other**, no build command).
2. Add environment variables:
   - `RESEND_API_KEY`: from https://resend.com
   - `CONTACT_TO_EMAIL`: NeeksxArt's inbox (comma-separate for multiple)
   - `CONTACT_FROM_EMAIL` *(optional)*: verified sender, e.g. `NeeksxArt Website <hello@yourdomain.com>`
3. Deploy. Until the email variables are set, the form shows a friendly "DM us on Instagram/Facebook" fallback.

## Socials
- Instagram: https://www.instagram.com/neeksxart/
- Facebook: https://www.facebook.com/NEEKSxART/
- TikTok: https://www.tiktok.com/@neeksxart
