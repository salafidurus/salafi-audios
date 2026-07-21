"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { COOKIES_LAST_UPDATE_DATE } from "@/features/legal/constants/update-date";
import styles from "./legal-screens.module.css";
import * as CookieSections from "../components/CookieSections";

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

        <div id="cookies-interpretation">
          <CookieSections.InterpretationAndDefinitions />
        </div>

        <div id="cookies-use">
          <CookieSections.UseOfCookies />
        </div>

        <div id="cookies-changes">
          <CookieSections.Changes />
        </div>

        <div id="cookies-contact">
          <CookieSections.ContactUs />
        </div>
      </div>
    </ScreenView>
  );
}
