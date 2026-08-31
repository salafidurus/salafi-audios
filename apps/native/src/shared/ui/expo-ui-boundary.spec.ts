import fs from "node:fs";
import path from "node:path";

import { APPROVED_NATIVE_BRIDGES, type NativeBridgeMetadata } from "./native-bridge-registry";

const VISUAL_REACT_NATIVE_IMPORTS = new Set([
  "ActivityIndicator",
  "Button",
  "FlatList",
  "Image",
  "ImageBackground",
  "Modal",
  "Pressable",
  "RefreshControl",
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

const LEGACY_SEMANTIC_MODULES = new Set([
  "@/shared/components/AppText/AppText",
  "@/shared/components/Button/Button",
  "@/shared/components/TextInput/TextInput",
  "@/shared/components/ScreenView/ScreenView",
  "@/shared/components/List",
]);

type VisualViolation = {
  file: string;
  source: string;
  imports: string[];
};

function nativeSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return nativeSourceFiles(target);
    return target.endsWith(".tsx") && !target.endsWith(".spec.tsx") ? [target] : [];
  });
}

function visualViolations(nativeRoot: string): VisualViolation[] {
  return nativeSourceFiles(path.join(nativeRoot, "src")).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    return [...source.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g)].flatMap(
      (match): VisualViolation[] => {
        const clause = match[1] ?? "";
        const moduleName = match[2] ?? "";
        const relativeFile = path.relative(nativeRoot, file);
        if (FORBIDDEN_VISUAL_PACKAGES.has(moduleName)) {
          return [{ file: relativeFile, source: moduleName, imports: ["*"] }];
        }
        if (moduleName !== "react-native") return [];

        const namedBindings = clause.match(/\{([^}]*)\}/)?.[1] ?? "";
        const imports = namedBindings
          .split(",")
          .map((binding) => binding.trim().split(/\s+as\s+/)[0] ?? "")
          .filter((name) => VISUAL_REACT_NATIVE_IMPORTS.has(name))
          .sort();

        return imports.length > 0 ? [{ file: relativeFile, source: moduleName, imports }] : [];
      },
    );
  });
}

function detectedBridgeFiles(nativeRoot: string): string[] {
  return nativeSourceFiles(path.join(nativeRoot, "src")).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const hasRnHostView = [
      ...source.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g),
    ].some((match) => {
      const clause = match[1] ?? "";
      const moduleName = match[2] ?? "";
      return moduleName.startsWith("@expo/ui") && /\bRNHostView\b/.test(clause);
    });
    return hasRnHostView ? [path.relative(nativeRoot, file)] : [];
  });
}

function detectedLegacyFeatureImports(nativeRoot: string): string[] {
  const featuresRoot = path.join(nativeRoot, "src/features");
  return nativeSourceFiles(featuresRoot).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const relativeFile = path.relative(nativeRoot, file);
    return [...source.matchAll(/from\s+["']([^"']+)["']/g)]
      .map((match) => match[1] ?? "")
      .filter((moduleName) => LEGACY_SEMANTIC_MODULES.has(moduleName))
      .map((moduleName) => `${relativeFile}: ${moduleName}`);
  });
}

describe("Expo UI visual boundary", () => {
  it("detects visual React Native imports and forbidden visual packages", () => {
    const violations = visualViolations(process.cwd());
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.every(({ file, source }) => file && source)).toBe(true);
    expect(violations.some(({ source }) => FORBIDDEN_VISUAL_PACKAGES.has(source))).toBe(true);
  });

  it("keeps every registered bridge pointed at an existing source file", () => {
    for (const bridge of APPROVED_NATIVE_BRIDGES) {
      expect(bridge.reason.length).toBeGreaterThan(20);
      expect(bridge.owner.length).toBeGreaterThan(0);
      expect(bridge.validationEvidence.length).toBeGreaterThan(20);
      expect(fs.existsSync(path.join(process.cwd(), bridge.file))).toBe(true);
      if (bridge.temporary) expect(bridge.removalCondition).toBeTruthy();
    }
  });

  it("enforces detected bridge and metadata parity in both directions", () => {
    const detected = new Set(detectedBridgeFiles(process.cwd()));
    const metadata = new Set(
      APPROVED_NATIVE_BRIDGES.filter((bridge) => bridge.kind === "bridge").map(
        (bridge) => bridge.file,
      ),
    );

    expect([...detected].sort()).toEqual([...metadata].sort());
    for (const bridge of APPROVED_NATIVE_BRIDGES) {
      expect(isNativeBridgeMetadata(bridge)).toBe(true);
      expect(bridge.file.length).toBeGreaterThan(0);
    }
  });

  it("prevents migrated feature code from importing legacy semantic components", () => {
    expect(detectedLegacyFeatureImports(process.cwd())).toEqual([]);
  });
});

function isNativeBridgeMetadata(bridge: NativeBridgeMetadata): boolean {
  return bridge.kind === "bridge" || bridge.kind === "infrastructure";
}
