"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LegalPageLayout } from "../components/LegalPageLayout";
import styles from "./legal-screens.module.css";
import * as PrivacySections from "../components/PrivacySections";

const PRIVACY_SECTIONS = [
  { id: "interpretation", title: "Interpretation and Definitions" },
  { id: "collecting", title: "Collecting and Using Your Personal Data" },
  { id: "use-of-data", title: "Use of Your Personal Data" },
  { id: "retention", title: "Retention of Your Personal Data" },
  { id: "transfer", title: "Transfer of Your Personal Data" },
  { id: "delete-data", title: "Delete Your Personal Data" },
  { id: "disclosure", title: "Disclosure of Your Personal Data" },
  { id: "security", title: "Security of Your Personal Data" },
  { id: "children", title: "Children's Privacy" },
  { id: "links", title: "Links to Other Websites" },
  { id: "changes", title: "Changes to this Privacy Policy" },
  { id: "contact", title: "Contact Us" },
];

export function PrivacyScreen() {
  return (
    <ScreenView>
      <LegalPageLayout
        title="Privacy Policy"
        lastUpdated="Last updated: July 21, 2026"
        introduction="This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy."
        sections={PRIVACY_SECTIONS}
      >
        <section id="interpretation">
          <PrivacySections.InterpretationAndDefinitions />
        </section>
        <section id="collecting">
          <PrivacySections.CollectingAndUsingData />
        </section>
        <section id="use-of-data">
          <PrivacySections.UseOfPersonalData />
        </section>
        <section id="retention">
          <PrivacySections.RetentionOfData />
        </section>
        <section id="transfer">
          <PrivacySections.TransferOfData />
        </section>
        <section id="delete-data">
          <PrivacySections.DeleteYourData />
        </section>
        <section id="disclosure">
          <PrivacySections.DisclosureOfData />
        </section>
        <section id="security">
          <PrivacySections.SecurityOfData />
        </section>
        <section id="children">
          <PrivacySections.ChildrensPrivacy />
        </section>
        <section id="links">
          <PrivacySections.LinksToOtherWebsites />
        </section>
        <section id="changes">
          <PrivacySections.ChangesToPrivacy />
        </section>
        <section id="contact">
          <PrivacySections.ContactUs />
        </section>
      </LegalPageLayout>
    </ScreenView>
  );
}
