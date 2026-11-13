import 'server-only';
/*
 * Card payments through Square.
 *
 * Setup (only two values needed):
 *   SQUARE_APP_ID=sandbox-sq0idb-…     Square Developer Dashboard → your app → Credentials → Application ID
 *   SQUARE_ACCESS_TOKEN=EAAA…          same page → Access token (server only, never exposed to the browser)
 *
 * Sandbox vs production is read from the Application ID (sandbox IDs start with "sandbox-").
 * The Location ID is looked up from the access token (first active location); set SQUARE_LOCATION_ID
 * to pin a specific one. SQUARE_ENV=sandbox|production overrides the auto-detection.
 *
 * Mode:
 *   both keys set        → square (real Square charges; sandbox charges are test money)
 *   no keys              → demo (every card approved, nothing charged)
 *   PAYMENTS_MODE=demo   → force demo even with keys
 *   PAYMENTS_MODE=square → square; if the keys are missing checkout refuses rather than faking a charge
 */
import { randomUUID } from 'node:crypto';

const SQUARE_VERSION = '2025-01-23';

const appId = () => (process.env.SQUARE_APP_ID || process.env.NEXT_PUBLIC_SQUARE_APP_ID || '').trim();
const token = () => (process.env.SQUARE_ACCESS_TOKEN || '').trim();

export const squareEnv = () => {
  const e = (process.env.SQUARE_ENV || '').trim().toLowerCase();
  if (e === 'production' || e === 'sandbox') return e;
  return appId().startsWith('sandbox-') ? 'sandbox' : 'production';
};
const apiBase = () => (squareEnv() === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com');

export const paymentsMode = () => {
  const m = (process.env.PAYMENTS_MODE || '').trim().toLowerCase();
  if (m === 'demo') return 'demo';
  if (m === 'square') return 'square';
  return appId() && token() ? 'square' : 'demo';
};
const squareReady = () => !!(appId() && token());

async function sq(path, init = {}) {
  const res = await fetch(apiBase() + path, {
    ...init,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', 'Square-Version': SQUARE_VERSION, ...init.headers },
    cache: 'no-store'
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

let cachedLocation = null; // { id, at }
/** SQUARE_LOCATION_ID, or the account's first active location that can take card payments */
export async function squareLocationId() {
  const pinned = (process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '').trim();
  if (pinned) return pinned;
  if (cachedLocation && Date.now() - cachedLocation.at < 60 * 60 * 1000) return cachedLocation.id;
  const { res, data } = await sq('/v2/locations');
  if (!res.ok) {
    console.error('square: could not list locations', res.status, data.errors?.[0]?.code, data.errors?.[0]?.detail);
    return null;
  }
  const locs = data.locations || [];
  const loc = locs.find(l => l.status === 'ACTIVE' && (l.capabilities || []).includes('CREDIT_CARD_PROCESSING'))
    || locs.find(l => l.status === 'ACTIVE') || locs[0];
  if (!loc) { console.error('square: this account has no locations'); return null; }
  cachedLocation = { id: loc.id, at: Date.now() };
  return loc.id;
}

/** what the browser needs to show Square's card field → { mode: 'demo' } or { mode: 'square', appId, locationId, env } */
export async function publicPaymentConfig() {
  if (paymentsMode() === 'demo') return { mode: 'demo' };
  if (!squareReady()) return { mode: 'square', error: 'Card payments are not set up yet.' };
  const locationId = await squareLocationId();
  if (!locationId) return { mode: 'square', error: 'Card payments are unavailable right now.' };
  return { mode: 'square', appId: appId(), locationId, env: squareEnv() };
}

/** → { ok, id, status, brand, last4, receiptUrl, demo } or { ok: false, error } */
export async function chargeCard({ sourceId, verificationToken, amountCents, orderNo, email, note, brand, last4 }) {
  if (paymentsMode() === 'demo') {
    await new Promise(r => setTimeout(r, 600)); // feel like a real round trip
    return { ok: true, demo: true, id: 'sq_demo_' + randomUUID().replace(/-/g, '').slice(0, 20), status: 'COMPLETED', brand, last4, receiptUrl: null };
  }
  if (!squareReady()) return { ok: false, error: 'Card payments are not set up yet, and nothing was charged.' };
  if (String(sourceId).startsWith('cnon:demo-')) return { ok: false, error: 'Please reload the page and enter your card again. Nothing was charged.' };
  const locationId = await squareLocationId();
  if (!locationId) return { ok: false, error: 'Card payments are unavailable right now, and nothing was charged.' };

  let res, data;
  try {
    ({ res, data } = await sq('/v2/payments', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        source_id: sourceId,
        verification_token: verificationToken || undefined,
        amount_money: { amount: amountCents, currency: 'USD' },
        location_id: locationId,
        reference_id: orderNo,
        buyer_email_address: email || undefined,
        note: note?.slice(0, 500),
        autocomplete: true
      })
    }));
  } catch (e) {
    console.error('square payment request failed', orderNo, e);
    return { ok: false, error: 'Could not reach the payment processor. Nothing was charged; please try again.' };
  }
  if (!res.ok || !data.payment) {
    const e = data.errors?.[0];
    console.error('square payment declined', orderNo, res.status, e?.code, e?.detail);
    return { ok: false, error: cardError(e) };
  }
  const p = data.payment;
  if (p.status !== 'COMPLETED' && p.status !== 'APPROVED') return { ok: false, error: 'The card was declined.' };
  return {
    // sandbox payments are test money, so they're flagged like demo orders (receipt, emails and dashboard say "test")
    ok: true, demo: squareEnv() === 'sandbox', id: p.id, status: p.status,
    brand: niceBrand(p.card_details?.card?.card_brand) || brand, last4: p.card_details?.card?.last_4 || last4,
    receiptUrl: p.receipt_url || null
  };
}

const niceBrand = b => ({ VISA: 'Visa', MASTERCARD: 'Mastercard', AMERICAN_EXPRESS: 'American Express', DISCOVER: 'Discover', DISCOVER_DINERS: 'Diners Club', JCB: 'JCB', CHINA_UNIONPAY: 'UnionPay' })[b] || (b ? b.replace(/_/g, ' ') : '');

/** Square error → message a customer can act on */
function cardError(e) {
  switch (e?.code) {
    case 'CARD_DECLINED': case 'GENERIC_DECLINE': return 'The card was declined. Please try another card.';
    case 'INSUFFICIENT_FUNDS': return 'The card was declined for insufficient funds.';
    case 'CVV_FAILURE': case 'INVALID_CVV': return 'The security code (CVV) didn’t match. Please check it and try again.';
    case 'ADDRESS_VERIFICATION_FAILURE': case 'INVALID_POSTAL_CODE': return 'The billing ZIP didn’t match the card. Please check it and try again.';
    case 'INVALID_EXPIRATION': case 'INVALID_EXPIRATION_DATE': case 'EXPIRATION_FAILURE': return 'The card’s expiry date is invalid or the card has expired.';
    case 'INVALID_CARD': case 'INVALID_CARD_DATA': case 'INVALID_ACCOUNT': return 'The card number is invalid. Please check it and try again.';
    case 'CARD_EXPIRED': return 'The card has expired.';
    case 'CARD_NOT_SUPPORTED': return 'This card type isn’t supported. Please try another card.';
    case 'CARD_TOKEN_USED': case 'CARD_TOKEN_EXPIRED': return 'Please enter your card again and retry. Nothing was charged.';
    case 'VERIFY_CVV_FAILURE': case 'VERIFY_AVS_FAILURE': return 'The card could not be verified. Please check the details and try again.';
    case 'UNAUTHORIZED': case 'ACCESS_TOKEN_EXPIRED': case 'ACCESS_TOKEN_REVOKED': return 'Card payments are unavailable right now, and nothing was charged.';
    default: return e?.detail ? `Payment failed: ${e.detail}` : 'The card was declined.';
  }
}

/** demo refund / balance collection (real Square versions use /v2/refunds and a stored card or invoice) */
export async function demoTransaction(prefix = 'sq_demo_') {
  return prefix + randomUUID().replace(/-/g, '').slice(0, 20);
}
