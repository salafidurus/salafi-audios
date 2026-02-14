"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/features/catalog/components/navigation/catalog-top-nav.module.css";
import { CatalogSearchInput } from "@/features/catalog/components/navigation/catalog-search-input";
import { Button } from "@/shared/components/button/button";

type CatalogTopNavProps = {
  searchPlaceholder: string;
};

export function CatalogTopNav({ searchPlaceholder }: CatalogTopNavProps) {
  const [isCondensed, setIsCondensed] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");

    const update = () => {
      setIsCondensed(media.matches && window.scrollY > 36);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const html = document.documentElement;

    const update = () => {
      html.style.setProperty("--home-top-nav-h", `${el.getBoundingClientRect().height}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      ref={(node) => {
        headerRef.current = node;
      }}
      className={styles["home-top-nav"]}
    >
      <div
        className={`${styles["home-top-nav-main"]} ${
          isCondensed ? styles["home-top-nav-main-condensed"] : ""
        }`.trim()}
      >
        <Link href="/" className={styles["home-brand-wrap"]} aria-label="Salafi Durus">
          <span className={styles["home-brand-mark"]} aria-hidden="true">
            <Image
              src="/logo/logo_72.png"
              alt=""
              width={32}
              height={32}
              priority
              className={styles["home-brand-img"]}
            />
          </span>
          <span className={styles["home-brand"]}>Salafi Durus</span>
        </Link>

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
          <Button
            variant="ghost"
            size="sm"
            aria-disabled="true"
            className={`${styles["home-auth-hide-mobile"]} ${styles["home-auth-ghost"]}`.trim()}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            aria-disabled="true"
            className={styles["home-auth-primary"]}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
