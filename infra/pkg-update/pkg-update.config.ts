export interface PkupdateConfig {
  groups: Record<string, { patterns: string[]; updateTypes?: ("major" | "minor" | "patch")[] }>;
  skip: string[];
  never: string[];
  versionLocked: string[];
  bun: { enabled: boolean };
  expo: { enabled: boolean };
}

export const config: PkupdateConfig = {
  groups: {
    // Ordinary dependency updates belong to Dependabot. The Expo and Bun
    // pipelines below are the only pkg-update entry points.
  },
  skip: [],
  never: ["typescript"],
  versionLocked: ["better-auth", "prisma"],
  bun: { enabled: true },
  expo: { enabled: true },
};
