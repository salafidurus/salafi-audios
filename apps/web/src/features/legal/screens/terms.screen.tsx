"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./legal-screens.module.css";
import * as TermsSections from "../components/TermsSections";

export function TermsScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms and Conditions</h1>
        <p className={styles.lastUpdated}>Last updated: July 21, 2026</p>
        <p className={styles.introduction}>
          Please read these terms and conditions carefully before using Our Service.
        </p>

        <TermsSections.InterpretationAndDefinitions />
        <TermsSections.Acknowledgment />
        <TermsSections.LinksToOtherWebsites />
        <TermsSections.Termination />
        <TermsSections.LimitationOfLiability />
        <TermsSections.DisclaimerSection />
        <TermsSections.GoverningLaw />
        <TermsSections.DisputeResolution />
        <TermsSections.EUUsers />
        <TermsSections.USCompliance />
        <TermsSections.SeverabilityAndWaiver />
        <TermsSections.TranslationInterpretation />
        <TermsSections.Changes />
        <TermsSections.ContactUs />
      </div>
    </ScreenView>
  );
}
