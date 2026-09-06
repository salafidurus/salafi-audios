import type { Context, ESTree, SourceCode } from "@oxlint/plugins";

import { defineRule } from "@oxlint/plugins";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PLACEHOLDER_PATTERN =
  /^(?:todo|fixme|documentation|description|placeholder|n\/a|tbd)(?:\s*[:!-].*)?[.!]?$/iu;

type DocumentationStatus = "missing" | "placeholder" | "valid";
type RuleMode = "migration" | "final";
type RuleScope = "all" | "production";
type RuleOptions = {
  baseline?: string;
  mode?: RuleMode;
  scope?: RuleScope;
};
type Baseline = { files?: Record<string, string> };

function documentationStatus(comment: ESTree.Comment | undefined): DocumentationStatus {
  if (comment === undefined || comment.type !== "Block" || !comment.value.trim().startsWith("*")) {
    return "missing";
  }
  const text = comment.value.replace(/^\s*\*\s?/gmu, "").trim();
  if (text.length === 0 || PLACEHOLDER_PATTERN.test(text)) return "placeholder";
  return "valid";
}

function nearestDocumentation(
  node: ESTree.Node,
  sourceCode: SourceCode,
): ESTree.Comment | undefined {
  // Ignore line comments used by neighboring linters for suppressions. A valid
  // TSDoc block may intentionally sit immediately before such a suppression.
  const comment = sourceCode
    .getCommentsBefore(node)
    .toReversed()
    .find((candidate) => candidate.type === "Block");
  // Permit one intervening line comment, such as a React Doctor suppression,
  // between the TSDoc block and the declaration it documents.
  if (comment === undefined || comment.loc.end.line + 2 < node.loc.start.line) return undefined;
  return comment;
}

function documentationTarget(node: ESTree.Node): ESTree.Node {
  return node.parent?.type === "ExportNamedDeclaration" ||
    node.parent?.type === "ExportDefaultDeclaration"
    ? node.parent
    : node;
}

function isMeaningfulStatement(node: ESTree.Statement | ESTree.Directive): boolean {
  return node.type !== "ImportDeclaration";
}

function isGeneratedFile(filename: string): boolean {
  return /(?:^|[/\\])(?:generated|dist|build|coverage|\.next)(?:[/\\]|$)/u.test(filename);
}

function isProductionFile(filename: string): boolean {
  return /(?:^|[/\\])(?:apps|packages)[/\\][^/\\]+[/\\]src[/\\]/u.test(filename);
}

function readBaseline(context: Context, configuredPath: string | undefined): Baseline {
  configuredPath ??= ".oxlint-docs-baseline.json";
  const candidates: string[] = [];
  let directory = dirname(resolve(process.cwd(), context.filename));
  for (let depth = 0; depth < 12; depth += 1) {
    candidates.push(resolve(directory, configuredPath));
    directory = dirname(directory);
  }
  const baselinePath = candidates.find((candidate) => existsSync(candidate));
  if (baselinePath === undefined) return {};
  try {
    return JSON.parse(readFileSync(baselinePath, "utf8")) as Baseline;
  } catch {
    return {};
  }
}

function sourceFingerprint(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

function isBaselineMatch(context: Context, baseline: Baseline, source: string): boolean {
  const fingerprint = sourceFingerprint(source);
  const absoluteFilename = resolve(process.cwd(), context.filename);
  return Object.entries(baseline.files ?? {}).some(
    ([filename, expectedFingerprint]) =>
      (context.filename.endsWith(filename) || absoluteFilename.endsWith(filename)) &&
      expectedFingerprint === fingerprint,
  );
}

function isExported(node: ESTree.Node): boolean {
  return (
    node.parent?.type === "ExportNamedDeclaration" ||
    node.parent?.type === "ExportDefaultDeclaration"
  );
}

function declarationName(node: ESTree.Node, sourceCode: SourceCode): string {
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "ClassDeclaration" ||
    node.type === "TSInterfaceDeclaration" ||
    node.type === "TSTypeAliasDeclaration" ||
    node.type === "TSEnumDeclaration" ||
    node.type === "TSDeclareFunction"
  ) {
    return node.id?.name ?? "<anonymous>";
  }
  return sourceCode.getText(node).split("\n", 1)[0]?.trim() ?? node.type;
}

function fieldName(node: ESTree.TSPropertySignature, sourceCode: SourceCode): string {
  return node.key.type === "Identifier" ? node.key.name : sourceCode.getText(node.key);
}

function isMeaningfulField(node: ESTree.TSPropertySignature, sourceCode: SourceCode): boolean {
  const name = fieldName(node, sourceCode);
  return /(?:status|state|slug|userId|createdAt|updatedAt|deletedAt|publishedAt|duration|language|role|kind|source|error|version)/iu.test(
    name,
  );
}

function hasDocumentedOverloadInSource(node: ESTree.Function, sourceCode: SourceCode): boolean {
  if (node.id === null) return false;
  const escapedName = node.id.name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const declarationPattern = new RegExp(`(?:export\\s+)?function\\s+${escapedName}\\b`, "gu");
  const documentedDeclarationPattern = new RegExp(
    `\\*/\\s*(?:export\\s+)?function\\s+${escapedName}\\b`,
    "u",
  );
  return (
    [...sourceCode.text.matchAll(declarationPattern)].length > 1 &&
    documentedDeclarationPattern.test(sourceCode.text)
  );
}

function reportMissing(node: ESTree.Node, context: Context, kind: string, name?: string) {
  context.report({
    node,
    messageId: "missingDocumentation",
    data: { kind, name: name ?? declarationName(node, context.sourceCode) },
  });
}

/**
 * Requires meaningful TSDoc coverage for human-maintained production declarations.
 *
 * All mutable analysis state is reset at the per-file lifecycle boundary so
 * diagnostics do not depend on worker assignment or file ordering.
 */
export const requireTSDocRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Require useful TSDoc summaries for production modules and meaningful declarations without duplicating TypeScript types.",
    },
    messages: {
      missingDocumentation:
        "Add a useful TSDoc comment for this {{kind}} (`{{name}}`). Document intent, behavior, invariants, side effects, or failure modes; do not use a placeholder.",
      placeholderDocumentation:
        "Replace the placeholder TSDoc comment for this {{kind}} (`{{name}}`) with useful intent, behavior, or contract documentation.",
      missingModuleDocumentation:
        "Add a useful TSDoc summary describing this module's responsibility.",
    },
    schema: [
      {
        type: "object",
        properties: {
          baseline: { type: "string" },
          mode: { enum: ["migration", "final"] },
          scope: { enum: ["all", "production"] },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ mode: "migration", scope: "production" }],
  },
  createOnce(context) {
    const options = ((context.options ?? [])[0] ?? {}) as RuleOptions;
    const scope = options.scope ?? "production";
    const mode =
      options.mode ?? (process.env.TSDOC_BASELINE_MODE === "final" ? "final" : "migration");
    let suppressed = false;
    let excluded = false;
    let moduleComment: ESTree.Comment | undefined;
    const documentedOverloads = new Set<string>();
    const visitedFunctionNames = new Set<string>();

    const checkDeclaration = (node: ESTree.Node, kind: string, name?: string) => {
      if (suppressed) return;
      const comment = nearestDocumentation(documentationTarget(node), context.sourceCode);
      if (comment === moduleComment) return reportMissing(node, context, kind, name);
      const status = documentationStatus(comment);
      if (status === "valid") return;
      if (status === "placeholder") {
        context.report({
          node,
          messageId: "placeholderDocumentation",
          data: { kind, name: name ?? declarationName(node, context.sourceCode) },
        });
        return;
      }
      reportMissing(node, context, kind, name);
    };

    const hasDocumentedOverload = (node: ESTree.Function): boolean => {
      if (node.id === null) return false;
      return context.sourceCode.ast.body.some((statement) => {
        const declaration =
          statement.type === "ExportNamedDeclaration" ||
          statement.type === "ExportDefaultDeclaration"
            ? statement.declaration
            : statement;
        if (declaration?.type !== "FunctionDeclaration" || declaration.id?.name !== node.id?.name)
          return false;
        const comment = nearestDocumentation(documentationTarget(declaration), context.sourceCode);
        return comment !== moduleComment && documentationStatus(comment) === "valid";
      });
    };

    return {
      before() {
        suppressed = false;
        excluded = false;
        moduleComment = undefined;
        documentedOverloads.clear();
        visitedFunctionNames.clear();

        const baseline = readBaseline(context, options.baseline);
        suppressed =
          mode === "migration" && isBaselineMatch(context, baseline, context.sourceCode.text);
        if (
          isGeneratedFile(context.filename) ||
          (scope === "production" && !isProductionFile(context.filename))
        ) {
          excluded = true;
          return false;
        }
      },
      Program(node) {
        if (excluded) return;
        const firstStatement = node.body.find(isMeaningfulStatement);
        if (firstStatement === undefined) return;
        const comments = context.sourceCode.getCommentsBefore(firstStatement);
        moduleComment = comments.find((comment) => documentationStatus(comment) !== "missing");
        if (documentationStatus(moduleComment) !== "valid") {
          if (!suppressed) context.report({ node, messageId: "missingModuleDocumentation" });
        }
        for (const statement of node.body) {
          const declaration =
            statement.type === "ExportNamedDeclaration" ||
            statement.type === "ExportDefaultDeclaration"
              ? statement.declaration
              : statement;
          if (declaration?.type !== "FunctionDeclaration" || declaration.id === null) continue;
          const comment = nearestDocumentation(
            documentationTarget(declaration),
            context.sourceCode,
          );
          if (comment !== moduleComment && documentationStatus(comment) === "valid") {
            documentedOverloads.add(declaration.id.name);
          }
        }
        const overloads = new Map<string, { count: number; documented: boolean }>();
        for (const statement of node.body) {
          const declaration =
            statement.type === "ExportNamedDeclaration" ||
            statement.type === "ExportDefaultDeclaration"
              ? statement.declaration
              : statement;
          if (declaration?.type !== "FunctionDeclaration" || declaration.id === null) continue;
          const entry = overloads.get(declaration.id.name) ?? { count: 0, documented: false };
          entry.count += 1;
          entry.documented ||= context.sourceCode
            .getCommentsBefore(statement)
            .some(
              (comment) => documentationStatus(comment) === "valid" && comment !== moduleComment,
            );
          overloads.set(declaration.id.name, entry);
        }
        for (const [name, overload] of overloads) {
          if (overload.count > 1 && overload.documented) documentedOverloads.add(name);
        }
      },
      FunctionDeclaration(node) {
        if (excluded) return;
        if (node.id !== null && visitedFunctionNames.has(node.id.name)) return;
        if (node.id !== null) visitedFunctionNames.add(node.id.name);
        const comment = nearestDocumentation(documentationTarget(node), context.sourceCode);
        if (
          node.id !== null &&
          comment !== moduleComment &&
          documentationStatus(comment) === "valid"
        ) {
          documentedOverloads.add(node.id.name);
        }
        if (
          isExported(node) &&
          !documentedOverloads.has(node.id?.name ?? "") &&
          !hasDocumentedOverload(node) &&
          !hasDocumentedOverloadInSource(node, context.sourceCode)
        ) {
          checkDeclaration(node, "function");
        }
      },
      ClassDeclaration(node) {
        if (excluded) return;
        if (isExported(node)) checkDeclaration(node, "class");
      },
      TSInterfaceDeclaration(node) {
        if (excluded) return;
        if (isExported(node)) checkDeclaration(node, "interface");
      },
      TSTypeAliasDeclaration(node) {
        if (excluded) return;
        if (isExported(node)) checkDeclaration(node, "type");
      },
      TSEnumDeclaration(node) {
        if (excluded) return;
        if (isExported(node)) checkDeclaration(node, "enum");
      },
      TSDeclareFunction(node) {
        if (excluded) return;
        if (node.id !== null && visitedFunctionNames.has(node.id.name)) return;
        if (node.id !== null) visitedFunctionNames.add(node.id.name);
        if (isExported(node)) checkDeclaration(node, "function");
      },
      VariableDeclaration(node) {
        if (excluded) return;
        if (isExported(node)) checkDeclaration(node, "declaration");
      },
      TSPropertySignature(node) {
        if (excluded) return;
        if (isMeaningfulField(node, context.sourceCode)) {
          checkDeclaration(node, "field", fieldName(node, context.sourceCode));
        }
      },
    };
  },
});
