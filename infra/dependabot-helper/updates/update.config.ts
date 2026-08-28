import { dependabotHelperPolicy } from "../policy";

export interface PkupdateConfig {
  groups: Record<string, { patterns: string[]; updateTypes?: ("major" | "minor" | "patch")[] }>;
  skip: string[];
  never: string[];
  versionLocked: string[];
  bun: { enabled: boolean };
  expo: { enabled: boolean };
}

const versionLocked = dependabotHelperPolicy.families.reduce<string[]>((locked, family) => {
  if (family.mode === "helper-check" && family.versionLocked) locked.push(family.name);
  return locked;
}, []);

const expoOwned = dependabotHelperPolicy.families.some(
  (family) => family.mode === "helper-update" && family.pipeline === "expo-sdk",
);

/** Runtime update settings derived from the canonical Helper policy. */
export const config: PkupdateConfig = {
  groups: {
    // Ordinary dependency updates belong to Dependabot. The Expo and Bun
    // Pipelines below are the only Helper-owned update entry points.
  },
  skip: [],
  never: ["typescript"],
  versionLocked,
  bun: { enabled: true },
  expo: { enabled: expoOwned },
};
