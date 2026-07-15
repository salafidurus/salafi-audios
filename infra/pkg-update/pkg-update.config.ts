export interface PkupdateConfig {
  groups: Record<string, { patterns: string[] }>;
  skip: string[];
  bun: { enabled: boolean };
  expo: { enabled: boolean };
}

export const config: PkupdateConfig = {
  groups: {
    nestjs: { patterns: ["@nestjs/*"] },
    prisma: { patterns: ["prisma", "@prisma/*"] },
    vitest: {
      patterns: ["vitest", "@vitest/*", "@vitejs/*", "vite-tsconfig-paths", "unplugin-swc"],
    },
    fastify: { patterns: ["@fastify/*"] },
    "better-auth": { patterns: ["better-auth", "@better-auth/*"] },
    turbo: { patterns: ["turbo"] },
    testing: { patterns: ["@testing-library/*"] },
  },
  skip: [
    "expo",
    "expo-*",
    "@expo/*",
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
  bun: { enabled: true },
  expo: { enabled: true },
};
