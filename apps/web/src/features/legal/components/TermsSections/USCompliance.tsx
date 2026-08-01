import styles from "../legal-sections.module.css";

export function USCompliance() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>United States Legal Compliance</h2>
      <p className={styles.paragraph}>
        You represent and warrant that (i) You are not located in a country that is subject to the
        United States government embargo, or that has been designated by the United States
        government as a "terrorist supporting" country, and (ii) You are not listed on any United
        States government list of prohibited or restricted parties.
      </p>
    </section>
  );
}
