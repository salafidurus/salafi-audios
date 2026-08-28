import { describe, expect, test } from "bun:test";

import { applyDocumentationEdits, createDocumentationEdits } from "./tsdoc-migrate";

describe("tsdoc-migrate", () => {
  test("uses AST boundaries and UTF-16 positions around Unicode and multiline imports", () => {
    const source =
      '/** ملخص الوحدة. */\nimport {\n  join,\n} from "node:path";\n\nexport function value() { return join("a", "b"); }\n';
    const result = applyDocumentationEdits(
      source,
      createDocumentationEdits(source, [
        {
          filename: "fixture.ts",
          message: "Add a useful TSDoc comment for this function (`value`).",
          labels: [{ span: { line: 6, column: 8 } }],
        },
      ]),
    );

    expect(result).toContain(
      "/** Documents the intent and contract of this declaration. */\nexport function",
    );
    expect(result).not.toContain("export fun/**");
  });

  test("places field documentation at an inline property AST boundary", () => {
    const source = "type Props = { value: string };\n";
    const result = applyDocumentationEdits(
      source,
      createDocumentationEdits(source, [
        {
          filename: "fixture.ts",
          message: "Add a useful TSDoc comment for this field (`value`).",
          labels: [{ span: { line: 1, column: 16 } }],
        },
      ]),
    );

    expect(result).toContain(
      "type Props = { /** Documents the intent and contract of this field. */ value",
    );
    expect(result).toContain("type Props = {");
  });
});
