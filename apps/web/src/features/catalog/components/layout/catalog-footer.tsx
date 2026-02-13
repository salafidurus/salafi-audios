import Link from "next/link";

export function CatalogFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer-grid">
        <div className="home-footer-brand-block">
          <p className="home-footer-brand">Salafi Durus</p>
          <p className="home-footer-copy">
            Providing authentic knowledge based on the Quran and Sunnah with an editorial, calm, and
            structured listening experience.
          </p>
          <div className="home-footer-social" aria-hidden="true">
            <span className="home-footer-social-item">x</span>
            <span className="home-footer-social-item">@</span>
            <span className="home-footer-social-item">rss</span>
          </div>
        </div>
        <div>
          <p className="home-footer-heading">Resources</p>
          <div className="home-footer-links">
            <Link href="/">Lecture Library</Link>
            <Link href="/">PDF Books</Link>
            <Link href="/">Scholar Profiles</Link>
            <Link href="/">Prayer Times</Link>
          </div>
        </div>
        <div>
          <p className="home-footer-heading">About Us</p>
          <div className="home-footer-links">
            <Link href="/">Our Mission</Link>
            <Link href="/">Donation Support</Link>
            <Link href="/">Contact Support</Link>
            <Link href="/">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <p className="home-footer-heading">Newsletter</p>
          <p className="home-footer-copy is-small">
            Get weekly updates on new series and live events.
          </p>
          <div className="home-footer-newsletter" aria-hidden="true">
            <input type="email" value="" placeholder="Email address" readOnly />
            <button type="button">&gt;</button>
          </div>
        </div>
      </div>
      <p className="home-footer-meta">
        Copyright 2026 Salafi Durus. Read-only public catalog preview.
      </p>
    </footer>
  );
}
