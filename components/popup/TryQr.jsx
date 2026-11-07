'use client';

import { useEffect, useState } from 'react';
import { qrSvg } from '@/lib/legacy/qr';

/** "Try it on your phone" QR on the /events page (points at the demo pop-up) */
export default function TryQr(props) {
  const [svg, setSvg] = useState('');
  useEffect(() => setSvg(qrSvg(`${window.location.origin}/event?e=demo&new=1`)), []);
  return <div {...props} dangerouslySetInnerHTML={{ __html: svg }} />;
}
