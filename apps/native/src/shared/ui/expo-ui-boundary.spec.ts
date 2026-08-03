import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { APPROVED_NATIVE_BRIDGES } from "./native-bridge-registry";

const VISUAL_REACT_NATIVE_IMPORTS = new Set([
  "ActivityIndicator",
  "Button",
  "FlatList",
  "Image",
  "ImageBackground",
  "Modal",
  "Pressable",
  "RefreshControl",
  "SafeAreaView",
  "ScrollView",
  "SectionList",
  "Switch",
  "Text",
  "TextInput",
  "TouchableHighlight",
  "TouchableOpacity",
  "View",
  "VirtualizedList",
]);

const FORBIDDEN_VISUAL_PACKAGES = new Set([
  "@expo/vector-icons",
  "expo-symbols",
  "lucide-react-native",
  "react-native-ease",
  "react-native-svg",
]);

type Violation = {
  file: string;
  source: string;
  imports: string[];
};

type LegacyVisualBaseline = {
  violationCount: number;
  files: string[];
};

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    if (!entry.name.endsWith(".tsx") || entry.name.endsWith(".spec.tsx")) return [];
    return [target];
  });
}

function visualViolations(nativeRoot: string): Violation[] {
  const sourceRoot = path.join(nativeRoot, "src");
  return sourceFiles(sourceRoot).flatMap((file) => {
    const sourceFile = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    return sourceFile.statements.flatMap((statement): Violation[] => {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
        return [];
      }

      const source = statement.moduleSpecifier.text;
      const relativeFile = path.relative(nativeRoot, file);
      if (FORBIDDEN_VISUAL_PACKAGES.has(source)) {
        return [{ file: relativeFile, source, imports: ["*"] }];
      }
      if (source !== "react-native") return [];

      const imports = statement.importClause?.namedBindings;
      if (!imports || !ts.isNamedImports(imports)) return [];
      const visualImports = imports.elements
        .map((element) => element.propertyName?.text ?? element.name.text)
        .filter((name) => VISUAL_REACT_NATIVE_IMPORTS.has(name))
        .sort();

      return visualImports.length > 0
        ? [{ file: relativeFile, source, imports: visualImports }]
        : [];
    });
  });
}

function percentageDimensionViolations(nativeRoot: string): string[] {
  const sourceRoot = path.join(nativeRoot, "src");

  return sourceFiles(sourceRoot).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const usesExpoUiLayout = sourceFile.statements.some((statement) => {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
        return false;
      }
      if (statement.moduleSpecifier.text !== "@expo/ui") return false;
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) return false;
      return bindings.elements.some((element) =>
        ["Column", "RNHostView", "Row", "ScrollView"].includes(
          element.propertyName?.text ?? element.name.text,
        ),
      );
    });

    return usesExpoUiLayout && /["']\d+%["']/.test(source) ? [path.relative(nativeRoot, file)] : [];
  });
}

describe("Expo UI visual boundary", () => {
  const nativeRoot = process.cwd();

  it("does not add unregistered React Native visual implementations", () => {
    const baselinePath = path.join(__dirname, "legacy-visual-imports.json");
    const violations = visualViolations(nativeRoot);
    const current: LegacyVisualBaseline = {
      violationCount: violations.length,
      files: [...new Set(violations.map((violation) => violation.file))].sort(),
    };
    if (!fs.existsSync(baselinePath)) {
      throw new Error(JSON.stringify(current, null, 2));
    }
    const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as LegacyVisualBaseline;

    expect(current).toEqual(baseline);
  });

  it("documents every permanent React Native bridge", () => {
    for (const bridge of APPROVED_NATIVE_BRIDGES) {
      expect(bridge.reason.length).toBeGreaterThan(20);
      expect(fs.existsSync(path.join(nativeRoot, bridge.file))).toBe(true);
    }
  });

  it("does not pass percentage dimensions to Expo UI layouts", () => {
    expect(percentageDimensionViolations(process.cwd())).toEqual([]);
  });
});
