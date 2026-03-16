import Link from "next/link";
import styles from "./footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Site footer" data-site-footer="true">
      <div className={styles.inner}>
        <span className={styles.meta}>© {year} Salafi Durus</span>
        <div className={styles.links}>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms-of-use">Terms of Service</Link>
          <Link href="/support">Support</Link>
        </div>
      </div>
    </footer>
  );
}
