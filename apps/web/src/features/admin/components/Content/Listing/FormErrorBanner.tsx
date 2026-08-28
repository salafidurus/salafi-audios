import styles from "./listing-modal.module.css";

/** Documents this module's responsibility and public boundary. */
/** Renders a compact validation message when the listing form has an error. */
export function FormErrorBanner({
  error,
}: {
  /** Text shown to the user when form submission or validation fails. */
  error?: string | null;
}) {
  return error ? <div className={styles.errorBanner}>{error}</div> : null;
}
