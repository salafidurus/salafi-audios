import Constants from "expo-constants";
import { Platform } from "react-native";
import { z } from "zod";

/** Provides the native core config runtime-env module responsibility. */
const NativeRuntimeExtraSchema = z.object({
  appEnv: z.enum(["development", "preview", "production"]).optional(),
  apiUrl: z.url().optional(),
  googleWebClientId: z.string().optional(),
  sentryDsn: z.url().optional(),
  sentryOrg: z.string().optional(),
  sentryProject: z.string().optional(),
  vexoProjectId: z.string().optional(),
});

/** Describes the NativeRuntimeExtra native type contract and behavior. */
export type NativeRuntimeExtra = z.infer<typeof NativeRuntimeExtraSchema>;
type RuntimeExtraCandidate = Partial<NativeRuntimeExtra> | null | undefined;

/** Describes the parseNativeRuntimeExtra native function contract and behavior. */
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

/** Describes the getRuntimeEnv native function contract and behavior. */
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

/** Describes the isDev native function contract and behavior. */
export function isDev(): boolean {
  return getRuntimeEnv()?.appEnv === "development";
}

// The Android emulator's "localhost" refers to the emulator itself, not the
// host machine. 10.0.2.2 is QEMU's alias back to the host's loopback address.
function rewriteLoopbackForAndroidEmulator(url: string): string {
  return url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/, "$110.0.2.2");
}

/** Describes the getApiBaseUrl native function contract and behavior. */
export function getApiBaseUrl(): string | undefined {
  const apiUrl = getRuntimeEnv()?.apiUrl;
  if (!apiUrl) {
    return apiUrl;
  }

  return __DEV__ && Platform.OS === "android" ? rewriteLoopbackForAndroidEmulator(apiUrl) : apiUrl;
}

/** Describes the getGoogleWebClientId native function contract and behavior. */
export function getGoogleWebClientId(): string | undefined {
  return getRuntimeEnv()?.googleWebClientId;
}
