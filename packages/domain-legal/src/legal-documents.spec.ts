import { describe, expect, it } from "bun:test";

import { getLegalDocument, legalDocuments } from "./legal-documents";

describe("legal documents", () => {
  it("publishes the documents required by the client routes", () => {
    expect(legalDocuments.map((document) => document.id)).toEqual(["terms", "privacy", "cookies"]);
    expect(getLegalDocument("terms")?.title.en).toBe("Terms of Service");
    expect(getLegalDocument("privacy")?.title.ar).toBe("سياسة الخصوصية");
  });

  it("keeps Privacy sections distinct from Terms sections", () => {
    const terms = getLegalDocument("terms");
    const privacy = getLegalDocument("privacy");

    expect(privacy?.sections.map((section) => section.id)).toEqual([
      "interpretation",
      "collecting",
      "use",
      "retention",
      "transfer",
      "delete",
      "disclosure",
      "security",
      "children",
      "links",
      "changes",
      "contact",
    ]);
    expect(privacy?.sections).not.toEqual(terms?.sections);
  });

  it("represents support destinations as semantic internal links", () => {
    const contact = getLegalDocument("privacy")?.sections.find(
      (section) => section.id === "contact",
    );
    const link = contact?.blocks.en.find((block) => block.type === "link");

    expect(link).toEqual({
      type: "link",
      text: "Support",
      href: { kind: "internal", destination: "support" },
    });
  });
});
