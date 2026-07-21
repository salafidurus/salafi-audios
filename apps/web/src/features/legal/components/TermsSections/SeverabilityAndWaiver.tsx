import styles from "../legal-sections.module.css";

export function SeverabilityAndWaiver() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Severability and Waiver</h2>

      <h3 className={styles.subsectionTitle}>Severability</h3>
      <p className={styles.paragraph}>
        If any provision of these Terms is held to be unenforceable or invalid, such provision will
        be changed and interpreted to accomplish the objectives of such provision to the greatest
        extent possible under applicable law and the remaining provisions will continue in full
        force and effect.
      </p>

      <h3 className={styles.subsectionTitle}>Waiver</h3>
      <p className={styles.paragraph}>
        Except as provided herein, the failure to exercise a right or to require performance of an
        obligation under these Terms shall not affect a party's ability to exercise such right or
        require such performance at any time thereafter nor shall the waiver of a breach constitute
        a waiver of any subsequent breach.
      </p>
    </section>
  );
}
