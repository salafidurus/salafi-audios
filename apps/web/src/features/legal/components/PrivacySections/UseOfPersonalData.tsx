import { DATA_USE_PURPOSES, DATA_SHARING } from "../../constants/privacy";
import styles from "../legal-sections.module.css";

export function UseOfPersonalData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Use of Your Personal Data</h2>
      <p className={styles.paragraph}>
        The Company may use Personal Data for the following purposes:
      </p>
      <ul className={styles.bulletList}>
        {DATA_USE_PURPOSES.map((purpose) => (
          <li key={purpose.title}>
            <strong>{purpose.title}:</strong> {purpose.desc}
          </li>
        ))}
      </ul>

      <p className={styles.paragraph}>
        We may share Your Personal Data in the following situations:
      </p>
      <ul className={styles.bulletList}>
        {DATA_SHARING.map((item) => (
          <li key={item.title}>
            <strong>{item.title}:</strong> {item.desc}
          </li>
        ))}
      </ul>
    </section>
  );
}
