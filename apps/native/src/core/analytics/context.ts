import { i18n } from "../i18n/i18n";

/** Runtime context construction for native analytics observations. */

/** Lifecycle state captured at the moment a native product event is recorded. */
export type NativeAnalyticsLifecycleState = "active" | "background" | "inactive";

/** Event-time runtime context owned by the native adapter. */
export type NativeAnalyticsContext = {
  /** Interface locale active when the event was observed. */
  interface_language?: string;
  timezone?: string;
  session_id: string;
  /** App lifecycle state captured with the event rather than inferred later. */
  lifecycle_state: NativeAnalyticsLifecycleState;
};

let sessionId: string | undefined;

function getSessionId(): string {
  sessionId ??= `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return sessionId;
}

function getTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/**
 * Builds native event-time context from runtime facts. Missing optional locale
 * or timezone data never prevents a caller from recording an event.
 */
export function createNativeAnalyticsContext(
  lifecycleState: NativeAnalyticsLifecycleState,
): NativeAnalyticsContext {
  return {
    interface_language: i18n.language || undefined,
    timezone: getTimezone(),
    session_id: getSessionId(),
    lifecycle_state: lifecycleState,
  };
}
