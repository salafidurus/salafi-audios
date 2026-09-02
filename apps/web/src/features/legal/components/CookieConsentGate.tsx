/** Documents this module's responsibility and public boundary. */
"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";

import { useCookieConsent } from "../hooks/use-cookie-consent";
import styles from "./cookie-consent-gate.module.css";

export function CookieConsentGate() {
  const { hasAccepted, isResolved, accept } = useCookieConsent();
  const { t } = useTranslation();

  if (!isResolved || hasAccepted) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-labelledby="consent-title" role="region">
      <div className={styles.content}>
        <div className={styles.message}>
          <p className={styles.eyebrow}>{t("cookieConsent.title", "Cookies and analytics")}</p>
          <p id="consent-title" className={styles.title}>
            {t(
              "cookieConsent.message",
              "We use cookies to understand site traffic and performance. Continuing to use the website indicates your acceptance of these tracking technologies.",
            )}
          </p>
          <p className={styles.policyLink}>
            <Link href={routes.cookiePolicy} className={styles.link}>
              {t("cookieConsent.policyLink", "Cookie Policy")}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={accept} size="md">
            {t("cookieConsent.close", "Close")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
