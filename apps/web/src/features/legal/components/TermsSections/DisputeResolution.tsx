import styles from "../legal-sections.module.css";

export function DisputeResolution() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Disputes Resolution</h2>
      <p className={styles.paragraph}>
        If You have any concern or dispute about the Service, You agree to first try to resolve the
        dispute informally by contacting the Company.
      </p>
    </section>
  );
}
