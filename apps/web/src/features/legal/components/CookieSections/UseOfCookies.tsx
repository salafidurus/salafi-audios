import styles from "../legal-sections.module.css";

export function UseOfCookies() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>The use of the Cookies</h2>

      <h3 className={styles.subsectionTitle}>Type of Cookies We Use</h3>
      <p className={styles.paragraph}>
        Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies
        remain on your personal computer or mobile device when You go offline, while Session Cookies
        are deleted as soon as You close your web browser.
      </p>
      <p className={styles.paragraph}>
        Where required by law, We will request your consent before using Cookies that are not
        strictly necessary. Strictly necessary Cookies are used to provide the Website and cannot be
        switched off in our systems.
      </p>
      <p className={styles.paragraph}>
        We use both session and persistent Cookies for the purposes set out below:
      </p>
      <ul className={styles.paragraph}>
        <li>
          <p>
            <strong>Necessary / Essential Cookies</strong>
          </p>
          <p>Type: Session Cookies</p>
          <p>Administered by: Us</p>
          <p>
            Purpose: These Cookies are essential to provide You with services available through the
            Website and to enable You to use some of its features. They help to authenticate users
            and prevent fraudulent use of user accounts. Without these Cookies, the services that
            You have asked for cannot be provided, and We only use these Cookies to provide You with
            those services.
          </p>
        </li>
        <li>
          <p>
            <strong>Functionality Cookies</strong>
          </p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>
            Purpose: These Cookies allow Us to remember choices You make when You use the Website,
            such as remembering your login details or language preference. The purpose of these
            Cookies is to provide You with a more personal experience and to avoid You having to
            re-enter your preferences every time You use the Website.
          </p>
        </li>
        <li>
          <p>
            <strong>Analytics Cookies</strong>
          </p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Vexo Analytics (third-party)</p>
          <p>
            Purpose: These Cookies collect anonymized usage and performance data such as pages
            viewed, session duration, device type, and browser information to help Us understand how
            You use the Website and improve our features. This data is not used for advertising or
            individual profiling.
          </p>
        </li>
      </ul>

      <h3 className={styles.subsectionTitle}>Your Choices Regarding Cookies</h3>
      <p className={styles.paragraph}>
        If You prefer to avoid the use of Cookies on the Website, first You must disable the use of
        Cookies in your browser and then delete the Cookies saved in your browser associated with
        the Website. You may use this option for preventing the use of Cookies at any time.
      </p>
      <p className={styles.paragraph}>
        If You do not accept Our Cookies, You may experience some inconvenience in your use of the
        Website and some features may not function properly.
      </p>
      <p className={styles.paragraph}>
        If You&apos;d like to delete Cookies or instruct your web browser to delete or refuse
        Cookies, please visit the help pages of your web browser.
      </p>
      <ul className={styles.paragraph}>
        <li>
          For the Chrome web browser, please visit this page from Google:{" "}
          <a
            href="https://support.google.com/accounts/answer/32050"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://support.google.com/accounts/answer/32050
          </a>
        </li>
        <li>
          For the Microsoft Edge browser, please visit this page from Microsoft:{" "}
          <a
            href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09
          </a>
        </li>
        <li>
          For the Firefox web browser, please visit this page from Mozilla:{" "}
          <a
            href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored
          </a>
        </li>
        <li>
          For the Safari web browser, please visit this page from Apple:{" "}
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac
          </a>
        </li>
      </ul>
      <p className={styles.paragraph}>
        For any other web browser, please visit your web browser&apos;s official web pages.
      </p>
    </section>
  );
}
