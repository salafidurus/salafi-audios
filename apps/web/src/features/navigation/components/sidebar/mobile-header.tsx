"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { Menu } from "lucide-react";
import styles from "./mobile-header.module.css";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label={t("navigation.openMenu", "Open menu")}
        aria-expanded="false"
      >
        <Menu size={24} />
      </button>

      <Link href={routes.home} className={styles.brand} aria-label={t("navigation.siteTitle")}>
        <span className={styles.brandMark} aria-hidden="true">
          <Image
            src="/logo/logo_72.png"
            alt=""
            width={28}
            height={28}
            priority
            className={styles.brandImg}
          />
        </span>
        <span className={styles.brandText}>{t("navigation.siteTitle", "Salafi Durus")}</span>
      </Link>

      <div className={styles.spacer} />
    </header>
  );
}
