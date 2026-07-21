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
          rights and how the law protects You.
        </p>
        <p className={styles.introduction}>
          We use Your Personal Data to provide and improve the Service. By using the Service, You
          agree to the collection and use of information in accordance with this Privacy Policy.
        </p>

        <PrivacySections.InterpretationAndDefinitions />
        <PrivacySections.CollectingAndUsingData />
        <PrivacySections.UseOfPersonalData />
        <PrivacySections.RetentionOfData />
        <PrivacySections.TransferOfData />
        <PrivacySections.DeleteYourData />
        <PrivacySections.DisclosureOfData />
        <PrivacySections.SecurityOfData />
        <PrivacySections.ChildrensPrivacy />
        <PrivacySections.LinksToOtherWebsites />
        <PrivacySections.ChangesToPrivacy />
        <PrivacySections.ContactUs />
      </div>
    </ScreenView>
  );
}
