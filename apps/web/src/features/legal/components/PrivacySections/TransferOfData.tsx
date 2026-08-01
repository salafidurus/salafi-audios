import styles from "../legal-sections.module.css";

export function TransferOfData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Transfer of Your Personal Data</h2>
      <p className={styles.paragraph}>
        Your information, including Personal Data, is processed at the Company's operating offices
        and in any other places where the parties involved in the processing are located. It means
        that this information may be transferred to — and maintained on — computers located outside
        of Your state, province, country or other governmental jurisdiction where the data
        protection laws may differ from those from Your jurisdiction.
      </p>
      <p className={styles.paragraph}>
        Where required by applicable law, We will ensure that international transfers of Your
        Personal Data are subject to appropriate safeguards and supplementary measures where
        appropriate. The Company will take all steps reasonably necessary to ensure that Your data
        is treated securely and in accordance with this Privacy Policy and no transfer of Your
        Personal Data will take place to an organization or a country unless there are adequate
        controls in place including the security of Your data and other personal information.
      </p>
    </section>
  );
}
