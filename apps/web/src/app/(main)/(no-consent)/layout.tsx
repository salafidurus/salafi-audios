"use client";

import { usePathname } from "next/navigation";
import { TableOfContents } from "@/features/legal/components/TableOfContents";

const PRIVACY_SECTIONS = [
  { id: "privacy-interpretation", title: "Interpretation and Definitions" },
  { id: "privacy-collecting", title: "Collecting and Using Your Personal Data" },
  { id: "privacy-use", title: "Use of Your Personal Data" },
  { id: "privacy-retention", title: "Retention of Your Personal Data" },
  { id: "privacy-transfer", title: "Transfer of Your Personal Data" },
  { id: "privacy-delete", title: "Delete Your Personal Data" },
  { id: "privacy-disclosure", title: "Disclosure of Your Personal Data" },
  { id: "privacy-security", title: "Security of Your Personal Data" },
  { id: "privacy-children", title: "Children's Privacy" },
  { id: "privacy-links", title: "Links to Other Websites" },
  { id: "privacy-changes", title: "Changes to this Privacy Policy" },
  { id: "privacy-contact", title: "Contact Us" },
];

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

export default function NoConsentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sections = pathname.includes("/privacy") ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <div className="appFrame">
      <div className="appNoConsentShell">
        <div className="appNoConsentContent">{children}</div>
        <TableOfContents sections={sections} />
      </div>
    </div>
  );
}
