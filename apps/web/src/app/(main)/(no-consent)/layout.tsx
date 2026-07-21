"use client";

import { usePathname } from "next/navigation";
import { TableOfContents } from "@/features/legal/components/TableOfContents";
import {
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  COOKIE_SECTIONS,
} from "@/features/legal/constants/sections";

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
