import styles from "../legal-sections.module.css";

export function Changes() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Changes to These Terms and Conditions</h2>
      <p className={styles.paragraph}>
        We reserve the right, at Our sole discretion, to modify or replace these Terms at any time.
        If a revision is material We will make reasonable efforts to provide at least 30 days'
        notice prior to any new terms taking effect. What constitutes a material change will be
        determined at Our sole discretion.
      </p>
      <p className={styles.paragraph}>
        By continuing to access or use Our Service after those revisions become effective, You agree
        to be bound by the revised terms. If You do not agree to the new terms, in whole or in part,
        please stop using the Service.
      </p>
    </section>
  );
}
