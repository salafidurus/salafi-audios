import Constants from "expo-constants";
import { z } from "zod";
import { AppEnvSchema } from "./build-env";

const MobileRuntimeExtraSchema = z.object({
  appEnv: AppEnvSchema,
  apiUrl: z.string().url(),
  sentryDsn: z.string().url().optional(),
  sentryOrg: z.string().optional(),
  sentryProject: z.string().optional(),
  vexoProjectId: z.string().optional(),
});

export type MobileRuntimeExtra = z.infer<typeof MobileRuntimeExtraSchema>;

function parseMobileRuntimeExtra(extra: unknown): MobileRuntimeExtra {
  const parsed = MobileRuntimeExtraSchema.safeParse(extra);
  if (!parsed.success) {
    throw new Error(
      [
        "Invalid MOBILE runtime extra.",
        "Make sure app.config.ts sets extra.appEnv and extra.apiUrl correctly.",
        parsed.error.message,
      ].join("\n"),
    );
  }
  return parsed.data;
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

let cachedEnv: ReturnType<typeof parseMobileRuntimeExtra> | null | undefined;
let hasLoggedRuntimeExtraWarning = false;

function getRuntimeExtra(): unknown {
  const constants = Constants as ConstantsWithLegacyManifests;

  return (
    constants.expoConfig?.extra ??
    constants.manifest2?.extra?.expoClient?.extra ??
    constants.manifest?.extra
  );
}

export function getRuntimeEnv() {
  if (cachedEnv !== undefined) {
    return cachedEnv;
  }

  try {
    cachedEnv = parseMobileRuntimeExtra(getRuntimeExtra());
  } catch (error) {
    if (!hasLoggedRuntimeExtraWarning) {
      hasLoggedRuntimeExtraWarning = true;
      // eslint-disable-next-line no-console
      console.warn(
        "Mobile runtime extra is unavailable during native startup. Native integrations will stay disabled until runtime config is present.",
        error,
      );
    }

    cachedEnv = null;
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
