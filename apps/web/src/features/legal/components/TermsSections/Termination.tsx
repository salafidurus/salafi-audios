import styles from "../legal-sections.module.css";

export function Termination() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Termination</h2>
      <p className={styles.paragraph}>
        We may terminate or suspend Your access immediately, without prior notice or liability, for
        any reason whatsoever, including without limitation if You breach these Terms and
        Conditions.
      </p>
      <p className={styles.paragraph}>
        Upon termination, Your right to use the Service will cease immediately.
      </p>
    </section>
  );
}
