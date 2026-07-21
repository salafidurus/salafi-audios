import styles from "../legal-sections.module.css";

export function ContactUs() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Contact Us</h2>
      <p className={styles.paragraph}>
        If you have any questions about this Cookies Policy, You can contact us:
      </p>
      <ul className={styles.paragraph}>
        <li>
          By visiting this page on our website:{" "}
          <a href="https://www.salafidurus.com/support" target="_blank" rel="noopener noreferrer">
            https://www.salafidurus.com/support
          </a>
        </li>
      </ul>
    </section>
  );
}
