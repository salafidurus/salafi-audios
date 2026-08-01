import { TERMS_DEFINITIONS } from "../../constants/terms";
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
      <p className={styles.paragraph}>For the purposes of these Terms and Conditions:</p>
      <ul className={styles.definitionList}>
        {TERMS_DEFINITIONS.map((def) => (
          <li key={def.term}>
            <strong>{def.term}:</strong> {def.definition}
          </li>
        ))}
      </ul>
    </section>
  );
}
