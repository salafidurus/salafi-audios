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

      <h3 className={styles.subsectionTitle}>Links to Scholars' Social Media Profiles</h3>
      <p className={styles.paragraph}>
        The Service may display outbound links to the public social media profiles (including
        Facebook, Twitter/X, Telegram, and YouTube) of Scholars affiliated with the Service. These
        links are provided for informational purposes only and do not imply any endorsement or
        affiliation with those social media platforms.
      </p>
      <p className={styles.paragraph}>
        These links do not involve any embedded content from Your personal social media account, nor
        do they collect Your social media handles or account information. You acknowledge and agree
        that the Company shall not be responsible or liable for any content, goods, or services
        provided through those external social media platforms, and Your use of those platforms is
        governed by their respective terms and privacy policies.
      </p>
    </section>
  );
}
