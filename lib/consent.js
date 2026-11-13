/* =========================================================
   Photo permissions asked on every order with customer photos
   (online checkout + live pop-up). Both answers are required.
   Policy (/policy §4): we only share orders publicly with permission, and identifiable children
   under 18 are never used for promotion without separate parent/guardian permission.
   ========================================================= */
export const CONSENT = {
  social: {
    q: 'May we share photos of your finished order on our social media?',
    yes: 'Yes, you can share it', no: 'No, keep it private'
  },
  minor: {
    q: 'Do any of your photos show a child under 18?',
    yes: 'Yes', no: 'No'
  }
};

export const MINOR_NOTE = 'We never post photos of children without separate permission from a parent or guardian.';

const yn = v => (v === true || v === 'yes' ? true : v === false || v === 'no' ? false : null);

/** { social, minor } from 'yes'/'no' or booleans → booleans, or null if either answer is missing */
export function cleanConsent(c) {
  const social = yn(c?.social), minor = yn(c?.minor);
  return social === null || minor === null ? null : { social, minor };
}

/** may this order be posted? Only with a yes and no children in the photos */
export const canPost = c => !!c && c.social && !c.minor;

/** one line for emails, notes and the dashboard */
export const consentLine = c => !c ? 'Photo permissions: not recorded'
  : `Share on socials: ${c.social ? 'Yes' : 'No'} · Child under 18 in photos: ${c.minor ? 'Yes' : 'No'}${canPost(c) ? '' : ' → do not post'}`;
