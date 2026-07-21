import styles from "../legal-sections.module.css";

export function LinksToOtherWebsites() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Links to Other Websites</h2>
      <p className={styles.paragraph}>
        Our Service may contain links to third-party websites or services that are not owned or
        controlled by the Company.
      </p>
      <p className={styles.paragraph}>
        The Company has no control over, and assumes no responsibility for, the content, privacy
        policies, or practices of any third-party websites or services. You further acknowledge and
        agree that the Company shall not be responsible or liable, directly or indirectly, for any
        damage or loss caused or alleged to be caused by or in connection with the use of or
        reliance on any such content, goods or services available on or through any such websites or
        services.
      </p>
      <p className={styles.paragraph}>
        We strongly advise You to read the terms and conditions and privacy policies of any
        third-party websites or services that You visit.
      </p>

      <h3 className={styles.subsectionTitle}>Links from a Third-Party Social Media Service</h3>
      <p className={styles.paragraph}>
        The Service may display, include, make available, or link to content or services provided by
        a Third-Party Social Media Service. A Third-Party Social Media Service is not owned or
        controlled by the Company, and the Company does not endorse or assume responsibility for any
        Third-Party Social Media Service.
      </p>
      <p className={styles.paragraph}>
        You acknowledge and agree that the Company shall not be responsible or liable, directly or
        indirectly, for any damage or loss caused or alleged to be caused by or in connection with
        Your access to or use of any Third-Party Social Media Service, including any content, goods,
        or services made available through them. Your use of any Third-Party Social Media Service is
        governed by that Third-Party Social Media Service's terms and privacy policies.
      </p>
    </section>
  );
}
