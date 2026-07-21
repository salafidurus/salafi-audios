import styles from "../legal-sections.module.css";

export function RetentionOfData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Retention of Your Personal Data</h2>
      <p className={styles.paragraph}>
        The Company will retain Your Personal Data only for as long as is necessary for the purposes
        set out in this Privacy Policy. We will retain and use Your Personal Data to the extent
        necessary to comply with our legal obligations (for example, if We are required to retain
        Your data to comply with applicable laws), resolve disputes, and enforce our legal
        agreements and policies.
      </p>
      <p className={styles.paragraph}>
        Where possible, We apply shorter retention periods and/or reduce identifiability by
        deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods
        below are maximum periods ("up to") and We may delete or anonymize data sooner when it is no
        longer needed for the relevant purpose. We apply different retention periods to different
        categories of Personal Data based on the purpose of processing and legal obligations:
      </p>

      <h3 className={styles.subsectionTitle}>Retention Periods</h3>
      <ul className={styles.bulletList}>
        <li>
          <strong>Account Information</strong>
          <ul className={styles.bulletList}>
            <li>
              User Accounts: retained for the duration of your account relationship plus up to 24
              months after account closure to handle any post-termination issues or resolve
              disputes.
            </li>
          </ul>
        </li>
        <li>
          <strong>Customer Support Data</strong>
          <ul className={styles.bulletList}>
            <li>
              Support tickets and correspondence: up to 24 months from the date of ticket closure to
              resolve follow-up inquiries, track service quality, and defend against potential legal
              claims
            </li>
            <li>
              Chat transcripts: up to 24 months for quality assurance and staff training purposes.
            </li>
          </ul>
        </li>
        <li>
          <strong>Usage Data</strong>
          <ul className={styles.bulletList}>
            <li>
              Website analytics data (cookies, IP addresses, device identifiers): up to 24 months
              from the date of collection, which allows us to analyze trends while respecting
              privacy principles.
            </li>
            <li>
              Application usage statistics: up to 24 months to understand feature adoption and
              service improvements.
            </li>
            <li>
              Server logs (IP addresses, access times): up to 24 months for security monitoring and
              troubleshooting purposes.
            </li>
          </ul>
        </li>
      </ul>

      <p className={styles.paragraph}>
        Usage Data is retained in accordance with the retention periods described above, and may be
        retained longer only where necessary for security, fraud prevention, or legal compliance.
      </p>

      <h3 className={styles.subsectionTitle}>Extended Retention</h3>
      <p className={styles.paragraph}>
        We may retain Personal Data beyond the periods stated above for different reasons:
      </p>
      <ul className={styles.bulletList}>
        <li>
          <strong>Legal obligation:</strong> We are required by law to retain specific data (e.g.,
          financial records for tax authorities).
        </li>
        <li>
          <strong>Legal claims:</strong> Data is necessary to establish, exercise, or defend legal
          claims.
        </li>
        <li>
          <strong>Your explicit request:</strong> You ask Us to retain specific information.
        </li>
        <li>
          <strong>Technical limitations:</strong> Data exists in backup systems that are scheduled
          for routine deletion.
        </li>
      </ul>

      <p className={styles.paragraph}>
        You may request information about how long We will retain Your Personal Data by contacting
        Us.
      </p>

      <h3 className={styles.subsectionTitle}>Data Deletion Procedures</h3>
      <p className={styles.paragraph}>
        When retention periods expire, We securely delete or anonymize Personal Data according to
        the following procedures:
      </p>
      <ul className={styles.bulletList}>
        <li>
          <strong>Deletion:</strong> Personal Data is removed from Our systems and no longer
          actively processed.
        </li>
        <li>
          <strong>Backup retention:</strong> Residual copies may remain in encrypted backups for a
          limited period consistent with our backup retention schedule and are not restored except
          where necessary for security, disaster recovery, or legal compliance.
        </li>
        <li>
          <strong>Anonymization:</strong> In some cases, We convert Personal Data into anonymous
          statistical data that cannot be linked back to You. This anonymized data may be retained
          indefinitely for research and analytics.
        </li>
      </ul>
    </section>
  );
}
