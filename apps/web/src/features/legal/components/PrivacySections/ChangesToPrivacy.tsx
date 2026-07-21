import styles from "../legal-sections.module.css";

export function ChangesToPrivacy() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Changes to this Privacy Policy</h2>
      <p className={styles.paragraph}>
        We may update Our Privacy Policy from time to time. We will notify You of any changes by
        posting the new Privacy Policy on this page.
      </p>
      <p className={styles.paragraph}>
        We will let You know via email and/or a prominent notice on Our Service, prior to the change
        becoming effective and update the "Last updated" date at the top of this Privacy Policy.
      </p>
      <p className={styles.paragraph}>
        You are advised to review this Privacy Policy periodically for any changes. Changes to this
        Privacy Policy are effective when they are posted on this page.
      </p>
    </section>
  );
}
