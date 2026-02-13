"use client";

import { useEffect, useState } from "react";
import styles from "@/features/catalog/components/navigation/catalog-top-nav.module.css";
import { CatalogSearchInput } from "@/features/catalog/components/navigation/catalog-search-input";

type CatalogTopNavProps = {
  searchPlaceholder: string;
};

export function CatalogTopNav({ searchPlaceholder }: CatalogTopNavProps) {
  const [isMobileCondensed, setIsMobileCondensed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");

    const update = () => {
      setIsMobileCondensed(media.matches && window.scrollY > 36);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, []);

  return (
    <header className={styles["home-top-nav"]}>
      <div
        className={`${styles["home-top-nav-main"]} ${
          isMobileCondensed ? styles["home-top-nav-main-condensed"] : ""
        }`.trim()}
      >
        <div className={styles["home-brand-wrap"]} aria-label="Salafi Durus brand">
          <span className={styles["home-brand-mark"]} aria-hidden="true">
            SD
          </span>
          <p className={styles["home-brand"]}>Salafi Durus</p>
        </div>

        <nav className={styles["home-nav-links"]} aria-label="Primary navigation">
          <span className={`${styles["home-nav-link"]} ${styles["home-nav-link-active"]}`}>
            Browse
          </span>
          <span className={styles["home-nav-link"]}>Scholars</span>
          <span className={styles["home-nav-link"]}>Library</span>
          <span className={styles["home-nav-link"]}>Live</span>
        </nav>

        <CatalogSearchInput
          placeholder={searchPlaceholder}
          className={styles["home-search-slot"]}
        />

        <div className={styles["home-auth-actions"]}>
          <button type="button" className={styles["home-auth-link"]} aria-disabled="true">
            Sign In
          </button>
          <button type="button" className={styles["home-auth-cta"]} aria-disabled="true">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
