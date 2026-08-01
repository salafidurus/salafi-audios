import styles from "../legal-sections.module.css";

export function RetentionOfData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Retention of Your Personal Data</h2>
      <p className={styles.paragraph}>
        The Company will retain Your Personal Data only for as long as is necessary for the purposes
        set out in this Privacy Policy. We will retain and use Your Personal Data to the extent
        necessary to comply with our legal obligations (for example, if We are required to retain
        Your data to comply with applicable laws), resolve disputes, and enforce our legal
        agreements and policies.
      </p>
      <p className={styles.paragraph}>
        When Your Personal Data is no longer necessary for the purposes for which We collected it,
        or when You request deletion of Your account, We will securely delete or anonymize Your
        Personal Data. However, We may retain Personal Data for longer periods where necessary to
        comply with legal obligations, resolve disputes, or enforce our agreements.
      </p>
    </section>
  );
}
