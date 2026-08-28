import styles from "./listing-modal.module.css";

/** Documents this module's responsibility and public boundary. */
export function FormErrorBanner({ error }: { error?: string | null }) {
  return error ? <div className={styles.errorBanner}>{error}</div> : null;
}
