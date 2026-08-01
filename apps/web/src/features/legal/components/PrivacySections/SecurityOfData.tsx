import styles from "../legal-sections.module.css";

export function SecurityOfData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Security of Your Personal Data</h2>
      <p className={styles.paragraph}>
        The security of Your Personal Data is important to Us, but remember that no method of
        transmission over the Internet, or method of electronic storage is 100% secure. While We
        strive to use commercially reasonable means to protect Your Personal Data, We cannot
        guarantee its absolute security.
      </p>
    </section>
  );
}
