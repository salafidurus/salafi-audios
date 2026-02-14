import Image from "next/image";
import Link from "next/link";
import styles from "./catalog-footer.module.css";
import { Button } from "@/shared/components/button/button";
import { AtSign, Rss, Share2 } from "lucide-react";

export function CatalogFooter() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <Link href="/" className={styles.brand} aria-label="Salafi Durus">
            <span className={styles.mark} aria-hidden="true">
              <Image
                src="/logo/logo_72.png"
                alt=""
                width={36}
                height={36}
                className={styles.brandImg}
              />
            </span>
            <span className={styles.brandName}>Salafi Durus</span>
          </Link>

          <nav className={styles.links} aria-label="Footer links">
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Terms of Service</Link>
            <Link href="/">Contact Support</Link>
          </nav>

          <div className={styles.actions} aria-label="Footer actions">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share"
              aria-disabled="true"
              className={styles.iconBtn}
            >
              <Share2 size={18} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Contact"
              aria-disabled="true"
              className={styles.iconBtn}
            >
              <AtSign size={18} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="RSS"
              aria-disabled="true"
              className={styles.iconBtn}
            >
              <Rss size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <p className={styles.meta}>
          © 2026 Salafi Durus. Dedicated to preserving and sharing authentic Islamic knowledge.
        </p>
      </div>
    </footer>
  );
}
