/** Renders the Cookie Policy route from the shared legal document model. */
"use client";

import { getLegalDocument } from "@sd/domain-legal";

import { LegalDocument } from "../components/LegalDocument";

/** Selects the shared Cookie Policy document and renders its web presentation. */
export function CookiePolicyScreen() {
  const document = getLegalDocument("cookies");
  return <LegalDocument document={document} />;
}
