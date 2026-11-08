/** "We print exactly what you upload" — shown on product pages, the Studio and the policy */
export default function PrintAsIs({ className = '' }) {
  return (
    <div className={`print-note ${className}`} role="note">
      <b>Your design prints exactly as uploaded.</b>{' '}
      We don&apos;t retouch, sharpen or redraw artwork. If an image is low resolution, blurry or a screenshot, it prints that way,
      so please send the original, highest-quality file you have.
    </div>
  );
}
