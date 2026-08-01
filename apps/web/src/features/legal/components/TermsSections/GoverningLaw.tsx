import styles from "../legal-sections.module.css";

export function GoverningLaw() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Governing Law</h2>
      <p className={styles.paragraph}>
        The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and
        Your use of the Service. Your use of the Application may also be subject to other local,
        state, national, or international laws.
      </p>
    </section>
  );
}
