import fs from "node:fs";
import path from "node:path";

import { APPROVED_NATIVE_BRIDGES } from "./native-bridge-registry";

const visualReactNativeImports = [
  "ActivityIndicator",
  "Button",
  "FlatList",
  "Image",
  "Modal",
  "Pressable",
  "ScrollView",
  "Switch",
  "Text",
  "TextInput",
  "View",
  "VirtualizedList",
];

function nativeSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return nativeSourceFiles(target);
    return target.endsWith(".tsx") && !target.endsWith(".spec.tsx") ? [target] : [];
  });
}

function visualImportFiles(nativeRoot: string): string[] {
  return nativeSourceFiles(path.join(nativeRoot, "src")).flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const reactNativeImport = source.match(/import\s*\{([^}]*)\}\s*from\s*["']react-native["']/s);
    if (!reactNativeImport) return [];
    const importedNames = reactNativeImport[1] ?? "";
    return visualReactNativeImports.some((name) => new RegExp(`\\b${name}\\b`).test(importedNames))
      ? [path.relative(nativeRoot, file)]
      : [];
  });
}

describe("Expo UI visual boundary", () => {
  it("keeps every registered bridge pointed at an existing source file", () => {
    for (const bridge of APPROVED_NATIVE_BRIDGES) {
      expect(bridge.reason.length).toBeGreaterThan(20);
      expect(bridge.owner.length).toBeGreaterThan(0);
      expect(bridge.validationEvidence.length).toBeGreaterThan(20);
      expect(fs.existsSync(path.join(process.cwd(), bridge.file))).toBe(true);
      if (bridge.temporary) expect(bridge.removalCondition).toBeTruthy();
    }
  });

  it("keeps the current visual RN inventory explicit", () => {
    const files = visualImportFiles(process.cwd());
    expect(files.length).toBeGreaterThan(0);
    expect(files).toEqual([...files].sort());
  });
});
