import styles from "../legal-sections.module.css";

export function InterpretationAndDefinitions() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Interpretation and Definitions</h2>

      <h3 className={styles.subsectionTitle}>Interpretation</h3>
      <p className={styles.paragraph}>
        The words whose initial letters are capitalized have meanings defined under the following
        conditions. The following definitions shall have the same meaning regardless of whether they
        appear in singular or in plural.
      </p>

      <h3 className={styles.subsectionTitle}>Definitions</h3>
      <p className={styles.paragraph}>For the purposes of this Cookies Policy:</p>
      <ul className={styles.definitionList}>
        <li>
          <strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;,
          &quot;Us&quot; or &quot;Our&quot; in this Cookies Policy) refers to Salafi Durus.
        </li>
        <li>
          <strong>Cookies</strong> means small files that are placed on Your computer, mobile device
          or any other device by a website, containing details of your browsing history on that
          website among its many uses.
        </li>
        <li>
          <strong>Website</strong> refers to Salafi Durus, accessible from{" "}
          <a href="https://www.salafidurus.com">https://www.salafidurus.com</a>.
        </li>
        <li>
          <strong>You</strong> means the individual accessing or using the Website, or a company, or
          any legal entity on behalf of which such individual is accessing or using the Website, as
          applicable.
        </li>
      </ul>
    </section>
  );
}
