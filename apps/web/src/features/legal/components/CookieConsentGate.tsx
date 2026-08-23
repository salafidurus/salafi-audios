"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";

import { useCookieConsent } from "../hooks/use-cookie-consent";
import styles from "./cookie-consent-gate.module.css";

export function CookieConsentGate() {
  const { hasAccepted, accept } = useCookieConsent();
  const { t } = useTranslation();

  if (hasAccepted) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-labelledby="consent-title" role="region">
      <div className={styles.content}>
        <div className={styles.message}>
          <p id="consent-title" className={styles.title}>
            {t(
              "cookieConsent.message",
              "We use cookies and analytics to improve your experience and understand how you use our service. By continuing, you accept our use of tracking technologies.",
            )}
          </p>
          <p className={styles.policyLink}>
            <Link href={routes.cookiePolicy} className={styles.link}>
              {t("cookieConsent.readPolicy", "Read our Cookie Policy for details")}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={accept} size="md">
            {t("cookieConsent.accept", "Accept")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
