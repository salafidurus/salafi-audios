import * as Sentry from "@sentry/react-native";
import { vexo } from "vexo-analytics";
import { mobileEnv, isDev } from "./env";

export function initIntegrations(): void {
  if (isDev) {
    return;
  }

  if (mobileEnv.sentryDsn) {
    Sentry.init({
      dsn: mobileEnv.sentryDsn,
      sendDefaultPii: true,
      environment: mobileEnv.appEnv,
    });
  }

  if (mobileEnv.vexoProjectId) {
    vexo(mobileEnv.vexoProjectId);
  }
}

export function getWrappedLayout<T extends React.ComponentType<unknown>>(
  Layout: T,
): T | ReturnType<typeof Sentry.wrap> {
  if (isDev || !mobileEnv.sentryDsn) {
    return Layout;
  }
  return Sentry.wrap(Layout) as T;
}
