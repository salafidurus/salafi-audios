import styles from "../legal-sections.module.css";

export function CollectingAndUsingData() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Collecting and Using Your Personal Data</h2>

      <h3 className={styles.subsectionTitle}>Types of Data Collected</h3>

      <h4 className={styles.subsubsectionTitle}>Personal Data</h4>
      <p className={styles.paragraph}>
        While using Our Service, We may ask You to provide Us with certain personally identifiable
        information that can be used to contact or identify You. Personally identifiable information
        may include, but is not limited to:
      </p>
      <ul className={styles.bulletList}>
        <li>Email address</li>
        <li>First name and last name</li>
      </ul>

      <h4 className={styles.subsubsectionTitle}>Usage Data</h4>
      <p className={styles.paragraph}>
        Usage Data is collected automatically when using the Service.
      </p>
      <p className={styles.paragraph}>
        Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP
        address), browser type, browser version, the pages of our Service that You visit, the time
        and date of Your visit, the time spent on those pages, unique device identifiers and other
        diagnostic data.
      </p>
      <p className={styles.paragraph}>
        When You access the Service by or through a mobile device, We may collect certain
        information automatically, including, but not limited to, the type of mobile device You use,
        Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating
        system, the type of mobile Internet browser You use, unique device identifiers and other
        diagnostic data.
      </p>
      <p className={styles.paragraph}>
        We may also collect information that Your browser sends whenever You visit Our Service or
        when You access the Service by or through a mobile device.
      </p>

      <h4 className={styles.subsubsectionTitle}>Tracking Technologies and Cookies</h4>
      <p className={styles.paragraph}>
        We use Cookies and similar tracking technologies to track the activity on Our Service and
        store certain information. Tracking technologies We use include beacons, tags, and scripts
        to collect and track information and to improve and analyze Our Service. The technologies We
        use may include:
      </p>
      <ul className={styles.bulletList}>
        <li>
          <strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your
          Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie
          is being sent. However, if You do not accept Cookies, You may not be able to use some
          parts of our Service.
        </li>
        <li>
          <strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain
          small electronic files known as web beacons (also referred to as clear gifs, pixel tags,
          and single-pixel gifs) that permit the Company, for example, to count users who have
          visited those pages or opened an email and for other related website statistics (for
          example, recording the popularity of a certain section and verifying system and server
          integrity).
        </li>
      </ul>
      <p className={styles.paragraph}>
        Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal
        computer or mobile device when You go offline, while Session Cookies are deleted as soon as
        You close Your web browser.
      </p>
      <p className={styles.paragraph}>
        Where required by law, we use non-essential cookies (such as analytics, advertising, and
        remarketing cookies) only with Your consent. You can withdraw or change Your consent at any
        time using Our cookie preferences tool (if available) or through Your browser/device
        settings. Withdrawing consent does not affect the lawfulness of processing based on consent
        before its withdrawal.
      </p>
      <p className={styles.paragraph}>
        We use both Session and Persistent Cookies for the purposes set out below:
      </p>
      <ul className={styles.bulletList}>
        <li>
          <strong>Necessary / Essential Cookies</strong>
          <br />
          Type: Session Cookies
          <br />
          Administered by: Us
          <br />
          Purpose: These Cookies are essential to provide You with services available through the
          Website and to enable You to use some of its features. They help to authenticate users and
          prevent fraudulent use of user accounts. Without these Cookies, the services that You have
          asked for cannot be provided, and We only use these Cookies to provide You with those
          services.
        </li>
        <li>
          <strong>Cookies Policy / Notice Acceptance Cookies</strong>
          <br />
          Type: Persistent Cookies
          <br />
          Administered by: Us
          <br />
          Purpose: These Cookies identify if users have accepted the use of cookies on the Website.
        </li>
        <li>
          <strong>Functionality Cookies</strong>
          <br />
          Type: Persistent Cookies
          <br />
          Administered by: Us
          <br />
          Purpose: These Cookies allow Us to remember choices You make when You use the Website,
          such as remembering your login details or language preference. The purpose of these
          Cookies is to provide You with a more personal experience and to avoid You having to
          re-enter your preferences every time You use the Website.
        </li>
      </ul>
      <p className={styles.paragraph}>
        For more information about the cookies we use and your choices regarding cookies, please
        visit our Cookies Policy or the Cookies section of Our Privacy Policy.
      </p>
    </section>
  );
}
