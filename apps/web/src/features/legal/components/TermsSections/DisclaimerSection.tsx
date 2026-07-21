import styles from "../legal-sections.module.css";

export function DisclaimerSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>"AS IS" and "AS AVAILABLE" Disclaimer</h2>
      <p className={styles.paragraph}>
        The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects
        without warranty of any kind. To the maximum extent permitted under applicable law, the
        Company, on its own behalf and on behalf of its Affiliates and its and their respective
        licensors and service providers, expressly disclaims all warranties, whether express,
        implied, statutory or otherwise, with respect to the Service, including all implied
        warranties of merchantability, fitness for a particular purpose, title and non-infringement,
        and warranties that may arise out of course of dealing, course of performance, usage or
        trade practice. Without limitation to the foregoing, the Company provides no warranty or
        undertaking, and makes no representation of any kind that the Service will meet Your
        requirements, achieve any intended results, be compatible or work with any other software,
        applications, systems or services, operate without interruption, meet any performance or
        reliability standards or be error free or that any errors or defects can or will be
        corrected.
      </p>
      <p className={styles.paragraph}>
        Without limiting the foregoing, neither the Company nor any of the company's provider makes
        any representation or warranty of any kind, express or implied: (i) as to the operation or
        availability of the Service, or the information, content, and materials or products included
        thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the
        accuracy, reliability, or currency of any information or content provided through the
        Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on
        behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs
        or other harmful components.
      </p>
      <p className={styles.paragraph}>
        Some jurisdictions do not allow the exclusion of certain types of warranties or limitations
        on applicable statutory rights of a consumer, so some or all of the above exclusions and
        limitations may not apply to You. But in such a case the exclusions and limitations set
        forth in this section shall be applied to the greatest extent enforceable under applicable
        law.
      </p>
    </section>
  );
}
