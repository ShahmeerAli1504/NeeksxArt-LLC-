import Link from 'next/link';
import { media } from '@/lib/media';
import { SITE } from '@/lib/site';
import { Instagram, Facebook, TikTok } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <img src={media('img/logo-white.png')} alt="NeeksxArt" width="768" height="551" loading="lazy" />
            <p>
              Helping brands get seen beyond the screen. Custom keychains, mirror keychains, magnets, buttons &amp;
              tap-to-connect merch, hand-pressed in Reno, NV.
            </p>
            <div className="socials">
              <a href={SITE.socials.instagram} target="_blank" rel="noopener" aria-label="Instagram"><Instagram /></a>
              <a href={SITE.socials.facebook} target="_blank" rel="noopener" aria-label="Facebook"><Facebook /></a>
              <a href={SITE.socials.tiktok} target="_blank" rel="noopener" aria-label="TikTok"><TikTok /></a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/magnets">Standard Custom Magnets</Link></li>
              <li><Link href="/catalog">Catalog</Link></li>
              <li><Link href="/pricing">Estimate Pricing</Link></li>
              <li><Link href="/favors">Events &amp; Party Favors</Link></li>
              <li><Link href="/events">NeeksxArt Live</Link></li>
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/studio">Merch Studio</Link></li>
              <li><Link href="/work">Our Work</Link></li>
              <li><Link href="/story">About Us</Link></li>
              <li><Link href="/contact#faq">FAQ</Link></li>
              <li><Link href="/policy">Orders &amp; Returns Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4>Studio</h4>
            <ul>
              <li>📍 Reno, Nevada</li>
              <li>📦 Ships nationwide</li>
              <li>✨ Free logo mockups</li>
              <li><a href={`mailto:${SITE.email}`}>✉️ {SITE.email}</a></li>
              <li><Link href="/contact">Send us a message →</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-word" aria-hidden="true">Merch people keep</div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} NeeksxArt LLC. All rights reserved.</span>
          <span>Website by <a href="https://www.nexoradigital.live" target="_blank" rel="noopener">Nexora Digital</a></span>
        </div>
      </div>
    </footer>
  );
}
