"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { routes } from "@sd/core-contracts";
import { Button } from "@/shared/components/Button/Button";
import { useTranslation } from "@/core/i18n/use-translation";
import { useCookieConsent } from "../hooks/use-cookie-consent";
import styles from "./cookie-consent-gate.module.css";

export function CookieConsentGate() {
  const { hasAccepted, accept } = useCookieConsent();
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!hasAccepted && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [hasAccepted]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  if (hasAccepted) {
    return null;
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="consent-title">
      <div className={styles.content}>
        <div className={styles.message}>
          <h1 id="consent-title" className={styles.title}>
            {t(
              "cookieConsent.message",
              "We use cookies and analytics to improve your experience and understand how you use our service. By continuing, you accept our use of tracking technologies.",
            )}
          </h1>
          <p className={styles.policyLink}>
            {t("cookieConsent.policyLink", "Cookie Policy")}:{" "}
            <Link
              href={routes.cookiePolicy}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("cookieConsent.policyLink", "Cookie Policy")}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={accept} size="md">
            {t("cookieConsent.accept", "Accept")}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
