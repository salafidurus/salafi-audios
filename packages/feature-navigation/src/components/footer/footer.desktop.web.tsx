import Link from "next/link";
import { routes } from "@sd/core-contracts";
import styles from "./footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Site footer" data-site-footer="true">
      <div className={styles.inner}>
        <span className={styles.meta}>© {year} Salafi Durus</span>
        <div className={styles.links}>
          <Link href={routes.privacy}>Privacy Policy</Link>
          <Link href={routes.termsOfUse}>Terms of Service</Link>
          <Link href={routes.support}>Support</Link>
        </div>
      </div>
    </footer>
  );
}
