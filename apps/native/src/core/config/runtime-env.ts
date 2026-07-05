import Constants from "expo-constants";
import { z } from "zod";

const NativeRuntimeExtraSchema = z.object({
  appEnv: z.enum(["development", "preview", "production"]).optional(),
  apiUrl: z.string().url().optional(),
  sentryDsn: z.string().url().optional(),
  sentryOrg: z.string().optional(),
  sentryProject: z.string().optional(),
  vexoProjectId: z.string().optional(),
});

export type NativeRuntimeExtra = z.infer<typeof NativeRuntimeExtraSchema>;

export function parseNativeRuntimeExtra(extra: unknown): NativeRuntimeExtra | null {
  const parsed = NativeRuntimeExtraSchema.safeParse(extra);
  return parsed.success ? parsed.data : null;
}

type ConstantsWithLegacyManifests = typeof Constants & {
  manifest?: {
    extra?: unknown;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        extra?: unknown;
      };
    };
  };
};

let cachedEnv: NativeRuntimeExtra | null | undefined;
let hasLoggedRuntimeExtraWarning = false;

function getRuntimeExtra(): unknown {
  const constants = Constants as ConstantsWithLegacyManifests;

  return (
    constants.expoConfig?.extra ??
    constants.manifest2?.extra?.expoClient?.extra ??
    constants.manifest?.extra
  );
}

export function getRuntimeEnv(): NativeRuntimeExtra | null {
  if (cachedEnv !== undefined) {
    return cachedEnv;
  }

  cachedEnv = parseNativeRuntimeExtra(getRuntimeExtra());

  if (!cachedEnv && !hasLoggedRuntimeExtraWarning) {
    hasLoggedRuntimeExtraWarning = true;
    console.warn(
      "Native runtime extra is unavailable during startup. API initialization will stay disabled until runtime config is present.",
    );
  }

  return cachedEnv;
}

export function isDev(): boolean {
  return getRuntimeEnv()?.appEnv === "development";
}

export function isPreview(): boolean {
  return getRuntimeEnv()?.appEnv === "preview";
}

export function isProduction(): boolean {
  return getRuntimeEnv()?.appEnv === "production";
}

export function getApiBaseUrl(): string | undefined {
  return getRuntimeEnv()?.apiUrl;
}
