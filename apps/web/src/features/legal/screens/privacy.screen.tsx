"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";
import * as PrivacySections from "../components/PrivacySections";

export function PrivacyScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: July 21, 2026</p>
        <p className={styles.introduction}>
          This Privacy Policy describes Our policies and procedures on the collection, use and
          disclosure of Your information when You use the Service and tells You about Your privacy
          rights and how the law protects You. We use Your Personal Data to provide and improve the
          Service. By using the Service, You agree to the collection and use of information in
          accordance with this Privacy Policy.
        </p>

        <section id="privacy-interpretation">
          <PrivacySections.InterpretationAndDefinitions />
        </section>
        <section id="privacy-collecting">
          <PrivacySections.CollectingAndUsingData />
        </section>
        <section id="privacy-use">
          <PrivacySections.UseOfPersonalData />
        </section>
        <section id="privacy-retention">
          <PrivacySections.RetentionOfData />
        </section>
        <section id="privacy-transfer">
          <PrivacySections.TransferOfData />
        </section>
        <section id="privacy-delete">
          <PrivacySections.DeleteYourData />
        </section>
        <section id="privacy-disclosure">
          <PrivacySections.DisclosureOfData />
        </section>
        <section id="privacy-security">
          <PrivacySections.SecurityOfData />
        </section>
        <section id="privacy-children">
          <PrivacySections.ChildrensPrivacy />
        </section>
        <section id="privacy-links">
          <PrivacySections.LinksToOtherWebsites />
        </section>
        <section id="privacy-changes">
          <PrivacySections.ChangesToPrivacy />
        </section>
        <section id="privacy-contact">
          <PrivacySections.ContactUs />
        </section>
      </div>
    </ScreenView>
  );
}
