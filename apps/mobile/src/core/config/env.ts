import Constants from "expo-constants";
import { parseMobileRuntimeExtra } from "@sd/core-env";

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

let cachedMobileEnv: ReturnType<typeof parseMobileRuntimeExtra> | null | undefined;
let hasLoggedRuntimeExtraWarning = false;

function getRuntimeExtra(): unknown {
  const constants = Constants as ConstantsWithLegacyManifests;

  return (
    constants.expoConfig?.extra ??
    constants.manifest2?.extra?.expoClient?.extra ??
    constants.manifest?.extra
  );
}

export function getMobileRuntimeEnv() {
  if (cachedMobileEnv !== undefined) {
    return cachedMobileEnv;
  }

  try {
    cachedMobileEnv = parseMobileRuntimeExtra(getRuntimeExtra());
  } catch (error) {
    if (!hasLoggedRuntimeExtraWarning) {
      hasLoggedRuntimeExtraWarning = true;
      console.warn(
        "Mobile runtime extra is unavailable during native startup. Native integrations will stay disabled until runtime config is present.",
        error,
      );
    }

    cachedMobileEnv = null;
  }

  return cachedMobileEnv;
}

export function isDev(): boolean {
  return getMobileRuntimeEnv()?.appEnv === "development";
}

export function isPreview(): boolean {
  return getMobileRuntimeEnv()?.appEnv === "preview";
}

export function isProduction(): boolean {
  return getMobileRuntimeEnv()?.appEnv === "production";
}

export function getApiBaseUrl(): string | undefined {
  return getMobileRuntimeEnv()?.apiUrl;
}
