import styles from "../legal-sections.module.css";

export function DisclosureOfData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Disclosure of Your Personal Data</h2>

      <h3 className={styles.subsectionTitle}>Business Transactions</h3>
      <p className={styles.paragraph}>
        If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be
        transferred. We will provide notice before Your Personal Data is transferred and becomes
        subject to a different Privacy Policy.
      </p>

      <h3 className={styles.subsectionTitle}>Law enforcement</h3>
      <p className={styles.paragraph}>
        Under certain circumstances, the Company may be required to disclose Your Personal Data if
        required to do so by law or in response to valid requests by public authorities (e.g. a
        court or a government agency).
      </p>

      <h3 className={styles.subsectionTitle}>Other legal requirements</h3>
      <p className={styles.paragraph}>
        The Company may disclose Your Personal Data in the good faith belief that such action is
        necessary to:
      </p>
      <ul className={styles.bulletList}>
        <li>Comply with a legal obligation</li>
        <li>Protect and defend the rights or property of the Company</li>
        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
        <li>Protect the personal safety of Users of the Service or the public</li>
        <li>Protect against legal liability</li>
      </ul>
    </section>
  );
}
