import styles from "./listing-modal.module.css";

export function FormErrorBanner({ error }: { error?: string | null }) {
  return error ? <div className={styles.errorBanner}>{error}</div> : null;
}
