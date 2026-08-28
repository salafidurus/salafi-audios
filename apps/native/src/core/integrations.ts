import type { ComponentType } from "react";

import * as Sentry from "@sentry/react-native";
import { vexo } from "vexo-analytics";

import { getRuntimeEnv, isDev } from "./config/runtime-env";

/** Provides the native core integrations module responsibility. */
/** Describes the initIntegrations native function contract and behavior. */
export function initIntegrations(): void {
  if (isDev()) {
    return;
  }

  const env = getRuntimeEnv();

  if (env?.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      sendDefaultPii: true,
      environment: env.appEnv,
    });
  }

  if (env?.vexoProjectId) {
    vexo(env.vexoProjectId);
  }
}

/** Describes the getWrappedLayout native function contract and behavior. */
export function getWrappedLayout<T extends ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  const env = getRuntimeEnv();

  if (isDev() || !env?.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout);
}
