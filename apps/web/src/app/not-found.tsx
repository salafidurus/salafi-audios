/** Renders the localized public 404 state without exposing protected navigation. */
"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { PublicShell } from "@/features/navigation/components/public-shell/public-shell";

import styles from "./not-found.module.css";

/** Renders the localized public 404 state without exposing protected navigation. */
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <PublicShell>
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
    </PublicShell>
  );
}
