'use client';

import { useEffect, useState } from 'react';
import { qrSvg } from '@/lib/legacy/qr';

/** QR on the /events page pointing at the live order page (only shown while Live ordering is ON) */
export default function TryQr({ path = '/event', ...props }) {
  const [svg, setSvg] = useState('');
  useEffect(() => setSvg(qrSvg(`${window.location.origin}${path}`)), [path]);
  return <div {...props} dangerouslySetInnerHTML={{ __html: svg }} />;
}
