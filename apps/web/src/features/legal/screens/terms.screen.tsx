/** Renders the Terms and Conditions route from the shared legal document model. */
"use client";

import { getLegalDocument } from "@sd/domain-legal";

import { LegalDocument } from "../components/LegalDocument";

/** Selects the shared Terms and Conditions document and renders its web presentation. */
export function TermsScreen() {
  const document = getLegalDocument("terms");
  return <LegalDocument document={document} />;
}
