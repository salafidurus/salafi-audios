"use client";

import Link from "next/link";
import { routes } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./not-found.module.css";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>404</p>
        <h1 className={styles.title}>{t("notFound.message", "Page not found")}</h1>
        <p className={styles.description}>
          {t(
            "notFound.description",
            "The page you are looking for does not exist or has been moved.",
          )}
        </p>
        <Link href={routes.home} className={styles.link}>
          {t("notFound.backHome", "Back to home")}
        </Link>
      </div>
    </main>
  );
}
