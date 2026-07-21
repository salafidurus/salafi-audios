"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { TERMS_LAST_UPDATE_DATE } from "@/features/legal/constants/update-date";
import styles from "./legal-screens.module.css";
import * as TermsSections from "../components/TermsSections";

export function TermsScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <p className={styles.lastUpdated}>Last updated: {TERMS_LAST_UPDATE_DATE}</p>
        <p className={styles.introduction}>
          Please read these terms and conditions carefully before using Our Service.
        </p>

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
      </div>
    </ScreenView>
  );
}
