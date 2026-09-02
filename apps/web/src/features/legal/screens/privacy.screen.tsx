/** Renders the Privacy Policy route from the shared legal document model. */
"use client";

import { getLegalDocument } from "@sd/domain-legal";

import { LegalDocument } from "../components/LegalDocument";

/** Selects the shared Privacy Policy document and renders its web presentation. */
export function PrivacyScreen() {
  const document = getLegalDocument("privacy");
  if (!document) return null;
  return <LegalDocument document={document} />;
}
