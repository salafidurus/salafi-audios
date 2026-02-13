import Link from "next/link";
import "./catalog-footer.css";

export function CatalogFooter() {
  return (
    <footer className="footer">
      <div className="grid">
        <div className="brandBlock">
          <p className="brand">Salafi Durus</p>
          <p className="copy">
            Providing authentic knowledge based on the Quran and Sunnah with an editorial, calm, and
            structured listening experience.
          </p>
          <div className="social" aria-hidden="true">
            <span className="socialItem">x</span>
            <span className="socialItem">@</span>
            <span className="socialItem">rss</span>
          </div>
        </div>
        <div>
          <p className="heading">Resources</p>
          <div className="links">
            <Link href="/">Lecture Library</Link>
            <Link href="/">PDF Books</Link>
            <Link href="/">Scholar Profiles</Link>
            <Link href="/">Prayer Times</Link>
          </div>
        </div>
        <div>
          <p className="heading">About Us</p>
          <div className="links">
            <Link href="/">Our Mission</Link>
            <Link href="/">Donation Support</Link>
            <Link href="/">Contact Support</Link>
            <Link href="/">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <p className="heading">Newsletter</p>
          <p className="copySmall">Get weekly updates on new series and live events.</p>
          <div className="newsletter" aria-hidden="true">
            <input type="email" value="" placeholder="Email address" readOnly />
            <button type="button">&gt;</button>
          </div>
        </div>
      </div>
      <p className="meta">Copyright 2026 Salafi Durus. Read-only public catalog preview.</p>
    </footer>
  );
}
