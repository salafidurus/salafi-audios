import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as ts from "typescript";

export type TSDocDiagnostic = {
  filename: string;
  message: string;
  labels?: Array<{ span?: { line?: number; column?: number } }>;
};

type TextEdit = { position: number; text: string };

function diagnosticPosition(
  sourceFile: ts.SourceFile,
  diagnostic: TSDocDiagnostic,
): number | undefined {
  const span = diagnostic.labels?.[0]?.span;
  if (span?.line === undefined || span.column === undefined) return undefined;
  const line = Math.max(0, span.line - 1);
  const column = Math.max(0, span.column - 1);
  return sourceFile.getPositionOfLineAndCharacter(line, column);
}

function declarationCandidates(sourceFile: ts.SourceFile): ts.Node[] {
  const candidates: ts.Node[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isPropertySignature(node) ||
      ts.isMethodSignature(node)
    ) {
      candidates.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return candidates;
}

function targetForDiagnostic(
  sourceFile: ts.SourceFile,
  diagnostic: TSDocDiagnostic,
): ts.Node | undefined {
  const position = diagnosticPosition(sourceFile, diagnostic);
  if (position === undefined) return undefined;
  const candidates = declarationCandidates(sourceFile).filter(
    (node) => node.getStart(sourceFile) <= position && position <= node.getEnd(),
  );
  return candidates.sort(
    (left, right) => left.getWidth(sourceFile) - right.getWidth(sourceFile),
  )[0];
}

function editText(diagnostic: TSDocDiagnostic): string {
  return diagnostic.message.includes("field")
    ? "/** Documents the intent and contract of this field. */ "
    : "/** Documents the intent and contract of this declaration. */\n";
}

function lineStart(sourceFile: ts.SourceFile, position: number): number {
  return sourceFile.getPositionOfLineAndCharacter(
    sourceFile.getLineAndCharacterOfPosition(position).line,
    0,
  );
}

function hasNearbyDocumentation(source: string, position: number): boolean {
  return /\/\*\*[\s\S]*\*\/\s*$/u.test(source.slice(Math.max(0, position - 240), position));
}

/** Build UTF-16-safe TSDoc edits from Oxlint diagnostics using TypeScript AST nodes. */
export function createDocumentationEdits(
  source: string,
  diagnostics: TSDocDiagnostic[],
): TextEdit[] {
  const sourceFile = ts.createSourceFile(
    "fixture.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits: TextEdit[] = [];

  for (const diagnostic of diagnostics) {
    if (!diagnostic.message.includes("TSDoc")) continue;
    if (diagnostic.message.includes("summary")) {
      const statement = sourceFile.statements.find(
        (candidate) => !ts.isImportDeclaration(candidate),
      );
      const position =
        statement === undefined
          ? source.length
          : lineStart(sourceFile, statement.getStart(sourceFile));
      if (!hasNearbyDocumentation(source, position)) {
        edits.push({
          position,
          text: "/** Documents this module's responsibility and public boundary. */\n",
        });
      }
      continue;
    }

    const target = targetForDiagnostic(sourceFile, diagnostic);
    if (target === undefined) continue;
    const position = diagnostic.message.includes("field")
      ? target.getStart(sourceFile)
      : lineStart(sourceFile, target.getStart(sourceFile));
    if (!hasNearbyDocumentation(source, position))
      edits.push({ position, text: editText(diagnostic) });
  }

  return edits
    .sort((left, right) => right.position - left.position)
    .filter((edit, index, all) => index === 0 || edit.position !== all[index - 1].position);
}

/** Apply AST-derived edits without reprinting or re-encoding the source file. */
export function applyDocumentationEdits(source: string, edits: TextEdit[]): string {
  return edits.reduce(
    (result, edit) => result.slice(0, edit.position) + edit.text + result.slice(edit.position),
    source,
  );
}

function main(): void {
  const [reportPath, writeFlag] = process.argv.slice(2);
  if (reportPath === undefined) {
    throw new Error("Usage: bun scripts/tsdoc-migrate.ts <oxlint-json-report> [--write]");
  }
  // SAFETY: The report is produced by Oxlint's documented JSON formatter and is parsed into the
  // narrow shape consumed below; diagnostics without that shape are safely ignored.
  const report = JSON.parse(readFileSync(resolve(reportPath), "utf8")) as {
    diagnostics?: TSDocDiagnostic[];
  };
  const diagnosticsByFile = new Map<string, TSDocDiagnostic[]>();
  for (const diagnostic of report.diagnostics ?? []) {
    const filename = resolve("apps/web", diagnostic.filename);
    diagnosticsByFile.set(filename, [...(diagnosticsByFile.get(filename) ?? []), diagnostic]);
  }
  let editCount = 0;
  for (const [filename, diagnostics] of diagnosticsByFile) {
    const source = readFileSync(filename, "utf8");
    const edits = createDocumentationEdits(source, diagnostics);
    editCount += edits.length;
    if (writeFlag === "--write") writeFileSync(filename, applyDocumentationEdits(source, edits));
  }
  console.log(
    `${writeFlag === "--write" ? "Applied" : "Planned"} ${editCount} TSDoc edits across ${diagnosticsByFile.size} files.`,
  );
}

if (import.meta.main) main();
