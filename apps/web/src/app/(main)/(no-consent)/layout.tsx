"use client";

import { TableOfContents } from "@/features/legal/components/TableOfContents";

const LEGAL_SECTIONS = [
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
  { id: "privacy-interpretation", title: "Privacy: Interpretation and Definitions" },
  { id: "privacy-collecting", title: "Privacy: Collecting and Using Your Personal Data" },
  { id: "privacy-use", title: "Privacy: Use of Your Personal Data" },
  { id: "privacy-retention", title: "Privacy: Retention of Your Personal Data" },
  { id: "privacy-transfer", title: "Privacy: Transfer of Your Personal Data" },
  { id: "privacy-delete", title: "Privacy: Delete Your Personal Data" },
  { id: "privacy-disclosure", title: "Privacy: Disclosure of Your Personal Data" },
  { id: "privacy-security", title: "Privacy: Security of Your Personal Data" },
  { id: "privacy-children", title: "Privacy: Children's Privacy" },
  { id: "privacy-links", title: "Privacy: Links to Other Websites" },
  { id: "privacy-changes", title: "Privacy: Changes to this Privacy Policy" },
  { id: "privacy-contact", title: "Privacy: Contact Us" },
];

export default function NoConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appNoConsentShell">
        <div className="appNoConsentContent">{children}</div>
        <TableOfContents sections={LEGAL_SECTIONS} />
      </div>
    </div>
  );
}
