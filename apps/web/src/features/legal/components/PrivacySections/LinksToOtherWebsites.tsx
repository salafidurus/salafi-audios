import styles from "../legal-sections.module.css";

export function LinksToOtherWebsites() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Links to Other Websites</h2>
      <p className={styles.paragraph}>
        Our Service may contain links to other websites that are not operated by Us. If You click on
        a third party link, You will be directed to that third party's site. We strongly advise You
        to review the Privacy Policy of every site You visit.
      </p>
      <p className={styles.paragraph}>
        We have no control over and assume no responsibility for the content, privacy policies or
        practices of any third party sites or services.
      </p>
    </section>
  );
}
