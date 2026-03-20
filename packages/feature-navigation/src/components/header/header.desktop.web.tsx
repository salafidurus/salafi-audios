"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../features/navigation/components/header/header.module.css";
import { Button } from "@sd/shared";

export function Header() {
  const headerRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

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
      <div className={styles.inner}>
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

        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>
            Create Free Account
          </Button>
        </div>
      </div>
    </header>
  );
}
