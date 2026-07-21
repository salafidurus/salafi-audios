import Link from "next/link";
import { routes } from "@sd/core-contracts";
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
          <Link href={routes.support} className={styles.link}>
            Support
          </Link>
        </li>
      </ul>
    </section>
  );
}
