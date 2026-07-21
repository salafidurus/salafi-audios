"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LegalPageLayout } from "../components/LegalPageLayout";
import styles from "./legal-screens.module.css";
import * as TermsSections from "../components/TermsSections";

const TERMS_SECTIONS = [
  { id: "interpretation", title: "Interpretation and Definitions" },
  { id: "acknowledgment", title: "Acknowledgment" },
  { id: "links", title: "Links to Other Websites" },
  { id: "termination", title: "Termination" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "disclaimer", title: '"AS IS" and "AS AVAILABLE" Disclaimer' },
  { id: "governing-law", title: "Governing Law" },
  { id: "disputes", title: "Disputes Resolution" },
  { id: "eu-users", title: "For European Union (EU) Users" },
  { id: "us-compliance", title: "United States Legal Compliance" },
  { id: "severability", title: "Severability and Waiver" },
  { id: "translation", title: "Translation Interpretation" },
  { id: "changes", title: "Changes to These Terms and Conditions" },
  { id: "contact", title: "Contact Us" },
];

export function TermsScreen() {
  return (
    <ScreenView>
      <LegalPageLayout
        title="Terms and Conditions"
        lastUpdated="Last updated: July 21, 2026"
        introduction="Please read these terms and conditions carefully before using Our Service."
        sections={TERMS_SECTIONS}
      >
        <section id="interpretation">
          <TermsSections.InterpretationAndDefinitions />
        </section>
        <section id="acknowledgment">
          <TermsSections.Acknowledgment />
        </section>
        <section id="links">
          <TermsSections.LinksToOtherWebsites />
        </section>
        <section id="termination">
          <TermsSections.Termination />
        </section>
        <section id="liability">
          <TermsSections.LimitationOfLiability />
        </section>
        <section id="disclaimer">
          <TermsSections.DisclaimerSection />
        </section>
        <section id="governing-law">
          <TermsSections.GoverningLaw />
        </section>
        <section id="disputes">
          <TermsSections.DisputeResolution />
        </section>
        <section id="eu-users">
          <TermsSections.EUUsers />
        </section>
        <section id="us-compliance">
          <TermsSections.USCompliance />
        </section>
        <section id="severability">
          <TermsSections.SeverabilityAndWaiver />
        </section>
        <section id="translation">
          <TermsSections.TranslationInterpretation />
        </section>
        <section id="changes">
          <TermsSections.Changes />
        </section>
        <section id="contact">
          <TermsSections.ContactUs />
        </section>
      </LegalPageLayout>
    </ScreenView>
  );
}
