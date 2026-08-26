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
    nestjs: { patterns: ["@nestjs/*"] },
    prisma: { patterns: ["prisma", "@prisma/*"] },
    fastify: { patterns: ["@fastify/*"] },
    "better-auth": { patterns: ["better-auth", "@better-auth/*"] },
    turbo: { patterns: ["turbo"] },
    testing: { patterns: ["@testing-library/*"] },
    typescript: { patterns: ["typescript"], updateTypes: ["minor", "patch"] },
    babel: {
      patterns: ["@babel/core", "@babel/runtime"],
      updateTypes: ["minor", "patch"],
    },
    expo: {
      patterns: [
        "expo",
        "expo-*",
        "@expo/*",
        "eslint-config-expo",
        "react",
        "react-dom",
        "@types/react",
        "@types/react-dom",
        "react-native",
        "react-native-*",
        "@react-native/*",
        "@react-navigation/*",
        "@sentry/*",
        "@react-native-async-storage/*",
      ],
    },
  },
  skip: [],
  never: ["typescript"],
  versionLocked: ["better-auth", "prisma"],
  bun: { enabled: true },
  expo: { enabled: true },
};
