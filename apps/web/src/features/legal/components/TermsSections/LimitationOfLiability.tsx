import styles from "../legal-sections.module.css";

export function LimitationOfLiability() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
      <p className={styles.paragraph}>
        To the maximum extent permitted by applicable law, the entire liability of the Company and
        any of its suppliers under any provision of these Terms shall not exceed the amount of any
        damages directly caused by a proven breach of these Terms.
      </p>
      <p className={styles.paragraph}>
        To the maximum extent permitted by applicable law, in no event shall the Company or its
        suppliers be liable for any special, incidental, indirect, or consequential damages
        whatsoever (including, but not limited to, damages for loss of profits, loss of data or
        other information, for business interruption, for personal injury, loss of privacy arising
        out of or in any way related to the use of or inability to use the Service, third-party
        software and/or third-party hardware used with the Service, or otherwise in connection with
        any provision of these Terms), even if the Company or any supplier has been advised of the
        possibility of such damages and even if the remedy fails of its essential purpose.
      </p>
      <p className={styles.paragraph}>
        Some states do not allow the exclusion of implied warranties or limitation of liability for
        incidental or consequential damages, which means that some of the above limitations may not
        apply. In these states, each party's liability will be limited to the greatest extent
        permitted by law.
      </p>
    </section>
  );
}
