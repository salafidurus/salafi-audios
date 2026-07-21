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

        <section id="terms-interpretation">
          <TermsSections.InterpretationAndDefinitions />
        </section>
        <section id="terms-acknowledgment">
          <TermsSections.Acknowledgment />
        </section>
        <section id="terms-links">
          <TermsSections.LinksToOtherWebsites />
        </section>
        <section id="terms-termination">
          <TermsSections.Termination />
        </section>
        <section id="terms-liability">
          <TermsSections.LimitationOfLiability />
        </section>
        <section id="terms-disclaimer">
          <TermsSections.DisclaimerSection />
        </section>
        <section id="terms-governing-law">
          <TermsSections.GoverningLaw />
        </section>
        <section id="terms-disputes">
          <TermsSections.DisputeResolution />
        </section>
        <section id="terms-eu-users">
          <TermsSections.EUUsers />
        </section>
        <section id="terms-us-compliance">
          <TermsSections.USCompliance />
        </section>
        <section id="terms-severability">
          <TermsSections.SeverabilityAndWaiver />
        </section>
        <section id="terms-translation">
          <TermsSections.TranslationInterpretation />
        </section>
        <section id="terms-changes">
          <TermsSections.Changes />
        </section>
        <section id="terms-contact">
          <TermsSections.ContactUs />
        </section>
      </div>
    </ScreenView>
  );
}
