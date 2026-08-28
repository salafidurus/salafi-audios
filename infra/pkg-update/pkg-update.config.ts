import { dependabotHelperPolicy } from "../dependabot-helper/policy";

export interface PkupdateConfig {
  groups: Record<string, { patterns: string[]; updateTypes?: ("major" | "minor" | "patch")[] }>;
  skip: string[];
  never: string[];
  versionLocked: string[];
  bun: { enabled: boolean };
  expo: { enabled: boolean };
}

const versionLocked = dependabotHelperPolicy.families
  .filter((family) => family.mode === "helper-check" && family.versionLocked)
  .map((family) => family.name);

const expoOwned = dependabotHelperPolicy.families.some(
  (family) => family.mode === "helper-update" && family.pipeline === "expo-sdk",
);

/** Transitional runtime adapter; dependency ownership comes from Helper policy. */
export const config: PkupdateConfig = {
  groups: {
    // Ordinary dependency updates belong to Dependabot. The Expo and Bun
    // pipelines below are the only pkg-update entry points.
  },
  skip: [],
  never: ["typescript"],
  versionLocked,
  bun: { enabled: true },
  expo: { enabled: expoOwned },
};
