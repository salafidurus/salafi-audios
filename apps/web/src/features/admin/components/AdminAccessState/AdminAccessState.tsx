/** Documents this module's responsibility and public boundary. */
"use client";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./admin-access-state.module.css";

/** Loading or denial state shown when an admin capability is unavailable. */
export type AdminAccessStateProps = {
  /** Access result that determines the explanatory state shown to the user. */
  status: "loading" | "denied";
};

/** Renders a stable admin loading or access-denied presentation. */
export function AdminAccessState({ status }: AdminAccessStateProps) {
  const { t } = useTranslation();
  const isLoading = status === "loading";

  return (
    <section
      className={styles.state}
      aria-live={isLoading ? "polite" : "assertive"}
      role={isLoading ? undefined : "alert"}
    >
      {isLoading ? (
        <p>{t("admin.checkingAccess", "Checking access…")}</p>
      ) : (
        <>
          <h1 className={styles.heading}>{t("admin.accessDeniedTitle", "Access Denied")}</h1>
          <p className={styles.message}>
            {t("admin.accessDenied", "You do not have admin access.")}
          </p>
        </>
      )}
    </section>
  );
}
