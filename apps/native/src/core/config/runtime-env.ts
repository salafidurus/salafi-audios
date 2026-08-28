import Constants from "expo-constants";
import { Platform } from "react-native";
import { z } from "zod";

/** Reads and validates runtime configuration required by the native client. */
const NativeRuntimeExtraSchema = z.object({
  appEnv: z.enum(["development", "preview", "production"]).optional(),
  apiUrl: z.url().optional(),
  googleWebClientId: z.string().optional(),
  sentryDsn: z.url().optional(),
  sentryOrg: z.string().optional(),
  sentryProject: z.string().optional(),
  vexoProjectId: z.string().optional(),
});

/** Defines the native native runtime extra contract shared by its consumers. */
export type NativeRuntimeExtra = z.infer<typeof NativeRuntimeExtraSchema>;
type RuntimeExtraCandidate = Partial<NativeRuntimeExtra> | null | undefined;

/** Transforms native runtime extra into the shape expected by native consumers. */
export function parseNativeRuntimeExtra(extra: RuntimeExtraCandidate): NativeRuntimeExtra | null {
  const parsed = NativeRuntimeExtraSchema.safeParse(extra);
  return parsed.success ? parsed.data : null;
}

type ConstantsWithLegacyManifests = typeof Constants & {
  manifest?: {
    extra?: object;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        extra?: object;
      };
    };
  };
};

let cachedEnv: NativeRuntimeExtra | null | undefined;
let hasLoggedRuntimeExtraWarning = false;

function getRuntimeExtra(): RuntimeExtraCandidate {
  // SAFETY: expo-constants exposes these legacy manifest properties at runtime
  // during older/native startup paths; this local structural view only reads
  // the optional `extra` objects if present.
  const constants = Constants as ConstantsWithLegacyManifests;

  return [
    constants.expoConfig?.extra,
    constants.manifest2?.extra?.expoClient?.extra,
    constants.manifest?.extra,
  ].reduce<RuntimeExtraCandidate>((selected, candidate) => selected ?? candidate, undefined);
}

/** Returns the the runtime env used by native consumers. */
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

/** Defines the native is dev contract used by this module. */
export function isDev(): boolean {
  return getRuntimeEnv()?.appEnv === "development";
}

// The Android emulator's "localhost" refers to the emulator itself, not the
// host machine. 10.0.2.2 is QEMU's alias back to the host's loopback address.
function rewriteLoopbackForAndroidEmulator(url: string): string {
  return url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/, "$110.0.2.2");
}

/** Returns the the api base url used by native consumers. */
export function getApiBaseUrl(): string | undefined {
  const apiUrl = getRuntimeEnv()?.apiUrl;
  if (!apiUrl) {
    return apiUrl;
  }

  return __DEV__ && Platform.OS === "android" ? rewriteLoopbackForAndroidEmulator(apiUrl) : apiUrl;
}

/** Returns the the google web client id used by native consumers. */
export function getGoogleWebClientId(): string | undefined {
  return getRuntimeEnv()?.googleWebClientId;
}
