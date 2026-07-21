import styles from "../legal-sections.module.css";

export function Acknowledgment() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Acknowledgment</h2>
      <p className={styles.paragraph}>
        These are the Terms and Conditions governing the use of this Service and the agreement
        between You and the Company. These Terms and Conditions set out the rights and obligations
        of all users regarding the use of the Service.
      </p>
      <p className={styles.paragraph}>
        Your access to and use of the Service is conditioned on Your acceptance of and compliance
        with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and
        others who access or use the Service.
      </p>
      <p className={styles.paragraph}>
        By accessing or using the Service You agree to be bound by these Terms and Conditions. If
        You disagree with any part of these Terms and Conditions then You may not access the
        Service.
      </p>
      <p className={styles.paragraph}>
        Your access to and use of the Service is also subject to Our Privacy Policy, which describes
        how We collect, use, and disclose personal information. Please read Our Privacy Policy
        carefully before using Our Service.
      </p>
    </section>
  );
}
