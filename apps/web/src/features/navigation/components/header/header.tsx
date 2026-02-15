"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/features/navigation/components/header/header.module.css";
import { SearchInput } from "@/features/navigation/components/search-input/search-input";
import { Button } from "@/shared/components/button/button";

type HeaderProps = {
  searchPlaceholder: string;
};

export function Header({ searchPlaceholder }: HeaderProps) {
  const [isCondensed, setIsCondensed] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const libraryDisabled = true;

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

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
      html.style.setProperty("--top-nav-height", `${el.getBoundingClientRect().height}px`);
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
      className={styles.header}
    >
      <div
        className={`${styles.headerMain} ${isCondensed ? styles.headerMainCondensed : ""}`.trim()}
      >
        <Link href="/" className={styles.brand} aria-label="Salafi Durus">
          <span className={styles.brandMark} aria-hidden="true">
            <Image
              src="/logo/logo_72.png"
              alt=""
              width={32}
              height={32}
              priority
              className={styles.brandImg}
            />
          </span>
          <span className={styles.brandText}>Salafi Durus</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <Link
            href="/scholars"
            className={`${styles.navLink} ${isActive("/scholars") ? styles.navLinkActive : ""}`.trim()}
          >
            Scholars
          </Link>
          {libraryDisabled ? (
            <span
              className={`${styles.navLink} ${styles.navLinkDisabled}`.trim()}
              title="Sign in required"
              aria-disabled="true"
            >
              Library
            </span>
          ) : (
            <Link
              href="/library"
              className={`${styles.navLink} ${isActive("/library") ? styles.navLinkActive : ""}`.trim()}
            >
              Library
            </Link>
          )}
          <Link
            href="/live"
            className={`${styles.navLink} ${isActive("/live") ? styles.navLinkActive : ""}`.trim()}
          >
            Live
          </Link>
        </nav>

        <SearchInput placeholder={searchPlaceholder} className={styles.searchSlot} />

        <div className={styles.authActions}>
          <Button
            variant="ghost"
            size="sm"
            className={`${styles.authHideMobile} ${styles.authGhost}`.trim()}
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            className={styles.authPrimary}
            onClick={() => router.push("/get-started")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
