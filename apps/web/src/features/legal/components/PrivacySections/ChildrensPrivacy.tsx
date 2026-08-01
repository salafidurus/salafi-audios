import styles from "../legal-sections.module.css";

export function ChildrensPrivacy() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Children's Privacy</h2>
      <p className={styles.paragraph}>
        Our Service does not knowingly collect personally identifiable information from children
        under the age of 13. If You are a parent or guardian and You are aware that Your child has
        provided Us with Personal Data, please contact Us. If We become aware that We have collected
        Personal Data from anyone under the age of 13 without verifiable parental consent, We take
        steps to remove that information from Our servers as soon as possible.
      </p>
      <p className={styles.paragraph}>
        If We need to rely on consent as a legal basis for processing Your information and Your
        country requires consent from a parent, We may require Your parent's consent before We
        collect and use that information.
      </p>
    </section>
  );
}
