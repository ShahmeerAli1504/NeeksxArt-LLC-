// /llms.txt — a plain-text brief for AI assistants (https://llmstxt.org).
// Built from the live catalog + pop-up packs, so prices here always match the site.
import { SITE } from '@/lib/site';
import { PRODUCTS, LIVE, money, singleTier, singleRange, bundlesFor } from '@/lib/catalog';

export const dynamic = 'force-static';

const u = p => SITE.url + p;

function body() {
  const products = PRODUCTS.map(p => {
    const s = singleTier(p);
    const packs = bundlesFor(p).map(b => `${b.qty}-pack ${money(b.price)} (${money(b.each)} each)`).join('; ');
    return `- **${p.name}** (${p.group}): ${p.desc} Single price ${money(s.each)} each for ${singleRange(p)} pieces.${packs ? ` Bundle packs: ${packs}.` : ''}${p.special ? ' Email or DM before ordering for a design consult.' : ''}`;
  }).join('\n');

  const live = LIVE.map(l => `- **${l.name}** (${l.note}): ${l.packs.map(([n, price]) => `${n} ${money(price)}`).join(', ')} before sales tax.`).join('\n');

  return `# ${SITE.name}

> ${SITE.description}

NeeksxArt (also written "Neeks x Art" or NEEKSxART) is based in Reno, Nevada, USA and ships nationwide. Tagline: "Merch people actually keep." Contact: ${SITE.email}. Instagram, Facebook and TikTok: @neeksxart.

## Key facts
- Products: custom magnets (2.5-inch square, 2.25-inch round), pin buttons (1-inch, 2.25-inch), keychains (1.5-inch, 2.25-inch metal), mirror keychains, Tap-to-Connect NFC keychains, and 3-inch pocket mirrors.
- No strict minimum order. Single pieces sell at the single price; bundle packs sell at exactly the pack quantity for a lower price per piece. Other quantities: email or DM.
- Designs print exactly as uploaded. Customers can preview their artwork live in the Merch Studio (${u('/studio')}) before ordering.
- Creative assistance (logo or artwork help): $40–$60 depending on complexity.
- Payment: paid in full at checkout before production. Orders of $1,000+ are arranged by email first.
- Delivery: free local delivery in Reno and Sparks, NV. Shipping is a flat $8 under $150; free on out-of-state orders of $150+ (merchandise subtotal before tax; Alaska and Hawaii excluded). Standard shipping takes 7-10 business days, but may take longer due to the holidays.
- Tap-to-Connect keychains contain an NFC chip programmed with the customer's link; any modern smartphone opens it with a tap, no app needed.
- NeeksxArt Live: at pop-up events guests scan a QR code, upload photos and pick up custom magnets or keychains in 10–15 minutes. NeeksxArt can be booked for weddings, parties and company events.

## Products and prices (USD)
${products}

## Live pop-up packs (made on-site at events)
${live}

## Pages
- [Home](${u('/')}): overview of NeeksxArt custom merch
- [Catalog](${u('/catalog')}): every product, photos, prices, add to cart
- [Pricing](${u('/pricing')}): full price sheet and order estimator
- [Merch Studio](${u('/studio')}): upload a logo or photo and preview it on each product
- [Custom Magnets](${u('/magnets')}): square and round photo and logo magnets
- [Live Pop-Ups](${u('/events')}): on-site photo magnets and keychains at events; book a pop-up
- [Events & Party Favors](${u('/favors')}): favors for weddings, baby showers, quinceañeras, birthdays, graduations, corporate events
- [Our Work](${u('/work')}): portfolio of past orders
- [Reviews](${u('/reviews')}): customer reviews
- [About Us](${u('/story')}): the story behind the studio
- [Contact & Bulk Orders](${u('/contact')}): inquiry form and FAQ
- [Policy](${u('/policy')}): custom orders, shipping, live magnets, returns and cancellations
`;
}

export function GET() {
  return new Response(body(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' }
  });
}
