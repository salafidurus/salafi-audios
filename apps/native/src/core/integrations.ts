import type { ComponentType } from "react";

import * as Sentry from "@sentry/react-native";
import { vexo } from "vexo-analytics";

import { getRuntimeEnv, isDev } from "./config/runtime-env";

/** Initializes native integrations and wraps platform-specific layout behavior. */
/** Initializes the integrations used by the native runtime. */
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

/** Returns the the wrapped layout used by native consumers. */
export function getWrappedLayout<T extends ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  const env = getRuntimeEnv();

  if (isDev() || !env?.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout);
}
