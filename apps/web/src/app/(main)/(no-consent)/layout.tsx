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
  { id: "terms-interpretation", title: "Interpretation and Definitions" },
  { id: "terms-acknowledgment", title: "Acknowledgment" },
  { id: "terms-links", title: "Links to Other Websites" },
  { id: "terms-termination", title: "Termination" },
  { id: "terms-liability", title: "Limitation of Liability" },
  { id: "terms-disclaimer", title: '"AS IS" and "AS AVAILABLE" Disclaimer' },
  { id: "terms-governing-law", title: "Governing Law" },
  { id: "terms-disputes", title: "Disputes Resolution" },
  { id: "terms-eu-users", title: "For European Union (EU) Users" },
  { id: "terms-us-compliance", title: "United States Legal Compliance" },
  { id: "terms-severability", title: "Severability and Waiver" },
  { id: "terms-translation", title: "Translation Interpretation" },
  { id: "terms-changes", title: "Changes to These Terms and Conditions" },
  { id: "terms-contact", title: "Contact Us" },
];

const COOKIE_SECTIONS = [
  { id: "cookies-interpretation", title: "Interpretation and Definitions" },
  { id: "cookies-use", title: "The use of the Cookies" },
  { id: "cookies-changes", title: "Changes to this Cookies Policy" },
  { id: "cookies-contact", title: "Contact Us" },
];

export default function NoConsentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  let sections = TERMS_SECTIONS;
  if (pathname.includes("/privacy")) {
    sections = PRIVACY_SECTIONS;
  } else if (pathname.includes("/cookie-policy")) {
    sections = COOKIE_SECTIONS;
  }

  return (
    <div className="appFrame">
      <div className="appNoConsentShell">
        <div className="appNoConsentContent">{children}</div>
        <TableOfContents sections={sections} />
      </div>
    </div>
  );
}
