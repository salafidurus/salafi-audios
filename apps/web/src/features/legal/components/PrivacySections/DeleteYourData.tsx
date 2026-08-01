import styles from "../legal-sections.module.css";

export function DeleteYourData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Delete Your Personal Data</h2>
      <p className={styles.paragraph}>
        You have the right to delete or request that We assist in deleting the Personal Data that We
        have collected about You.
      </p>
      <p className={styles.paragraph}>
        Our Service may give You the ability to delete certain information about You from within the
        Service.
      </p>
      <p className={styles.paragraph}>
        You may update, amend, or delete Your information at any time by signing in to Your Account,
        if you have one, and visiting the account settings section that allows you to manage Your
        personal information. You may also contact Us to request access to, correct, or delete any
        Personal Data that You have provided to Us.
      </p>
      <p className={styles.paragraph}>
        Please note, however, that We may need to retain certain information when we have a legal
        obligation or lawful basis to do so.
      </p>
    </section>
  );
}
