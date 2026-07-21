"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { COOKIES_LAST_UPDATE_DATE } from "@/features/legal/constants/update-date";
import styles from "./legal-screens.module.css";

export function CookiePolicyScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Cookies Policy</h1>
        <p className={styles.lastUpdated}>Last updated: {COOKIES_LAST_UPDATE_DATE}</p>
        <p className={styles.introduction}>
          This Cookies Policy explains what Cookies are and how We use them. You should read this
          policy so You can understand what type of cookies We use, or the information We collect
          using Cookies and how that information is used. This Cookies Policy has been created with
          the help of the{" "}
          <a
            href="https://www.termsfeed.com/cookies-policy-generator/"
            target="_blank"
            rel="noopener noreferrer"
          >
            TermsFeed Cookies Policy Generator
          </a>
          .
        </p>
        <p className={styles.paragraph}>
          Cookies do not typically contain any information that personally identifies a user, but
          personal information that We store about You may be linked to the information stored in
          and obtained from Cookies. For further information on how We use, store and keep your
          personal data secure, see our Privacy Policy.
        </p>
        <p className={styles.paragraph}>
          We do not store sensitive personal information, such as mailing addresses, account
          passwords, etc. in the Cookies We use.
        </p>

        <section id="cookies-interpretation">
          <h2>Interpretation and Definitions</h2>
          <h3>Interpretation</h3>
          <p className={styles.paragraph}>
            The words whose initial letters are capitalized have meanings defined under the
            following conditions. The following definitions shall have the same meaning regardless
            of whether they appear in singular or in plural.
          </p>
          <h3>Definitions</h3>
          <p className={styles.paragraph}>For the purposes of this Cookies Policy:</p>
          <ul className={styles.paragraph}>
            <li>
              <strong>Company</strong> (referred to as either &quot;the Company&quot;,
              &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Cookies Policy) refers to
              Salafi Durus.
            </li>
            <li>
              <strong>Cookies</strong> means small files that are placed on Your computer, mobile
              device or any other device by a website, containing details of your browsing history
              on that website among its many uses.
            </li>
            <li>
              <strong>Website</strong> refers to Salafi Durus, accessible from{" "}
              <a href="https://www.salafidurus.com" target="_blank" rel="noopener noreferrer">
                https://www.salafidurus.com
              </a>
              .
            </li>
            <li>
              <strong>You</strong> means the individual accessing or using the Website, or a
              company, or any legal entity on behalf of which such individual is accessing or using
              the Website, as applicable.
            </li>
          </ul>
        </section>

        <section id="cookies-use">
          <h2>The use of the Cookies</h2>
          <h3>Type of Cookies We Use</h3>
          <p className={styles.paragraph}>
            Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies
            remain on your personal computer or mobile device when You go offline, while Session
            Cookies are deleted as soon as You close your web browser.
          </p>
          <p className={styles.paragraph}>
            Where required by law, We will request your consent before using Cookies that are not
            strictly necessary. Strictly necessary Cookies are used to provide the Website and
            cannot be switched off in our systems.
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
                Purpose: These Cookies are essential to provide You with services available through
                the Website and to enable You to use some of its features. They help to authenticate
                users and prevent fraudulent use of user accounts. Without these Cookies, the
                services that You have asked for cannot be provided, and We only use these Cookies
                to provide You with those services.
              </p>
            </li>
            <li>
              <p>
                <strong>Functionality Cookies</strong>
              </p>
              <p>Type: Persistent Cookies</p>
              <p>Administered by: Us</p>
              <p>
                Purpose: These Cookies allow Us to remember choices You make when You use the
                Website, such as remembering your login details or language preference. The purpose
                of these Cookies is to provide You with a more personal experience and to avoid You
                having to re-enter your preferences every time You use the Website.
              </p>
            </li>
          </ul>
          <h3>Your Choices Regarding Cookies</h3>
          <p className={styles.paragraph}>
            If You prefer to avoid the use of Cookies on the Website, first You must disable the use
            of Cookies in your browser and then delete the Cookies saved in your browser associated
            with the Website. You may use this option for preventing the use of Cookies at any time.
          </p>
          <p className={styles.paragraph}>
            If You do not accept Our Cookies, You may experience some inconvenience in your use of
            the Website and some features may not function properly.
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

        <section id="cookies-changes">
          <h2>Changes to this Cookies Policy</h2>
          <p className={styles.paragraph}>
            We may update this Cookies Policy from time to time. The &quot;Last updated&quot; date
            at the top indicates when it was last revised.
          </p>
        </section>

        <section id="cookies-contact">
          <h2>Contact Us</h2>
          <p className={styles.paragraph}>
            If you have any questions about this Cookies Policy, You can contact us:
          </p>
          <ul className={styles.paragraph}>
            <li>
              By visiting this page on our website:{" "}
              <a
                href="https://www.salafidurus.com/support"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.salafidurus.com/support
              </a>
            </li>
          </ul>
        </section>
      </div>
    </ScreenView>
  );
}
