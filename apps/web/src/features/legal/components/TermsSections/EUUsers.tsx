import styles from "../legal-sections.module.css";

export function EUUsers() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>For European Union (EU) Users</h2>
      <p className={styles.paragraph}>
        If You are a European Union consumer, you will benefit from any mandatory provisions of the
        law of the country in which You are resident.
      </p>
    </section>
  );
}
