import * as SecureStore from "expo-secure-store";

/** Storage key for the resettable device-local anonymous analytics identity. */
const ANONYMOUS_ID_KEY = "analytics.anonymous_id";

function createAnonymousId(): string {
  return `anonymous-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Loads the device-local anonymous analytics identity, creating it once when
 * absent. SecureStore failures are surfaced so callers can disable optional
 * analytics rather than accidentally creating an identity that cannot persist.
 */
export async function getAnonymousAnalyticsId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ANONYMOUS_ID_KEY);
  if (existing) return existing;

  const next = createAnonymousId();
  await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, next);
  return next;
}

/**
 * Replaces the anonymous analytics identity for future events. Events already
 * buffered retain their original identity and are never linked to the new one.
 */
export async function resetAnonymousAnalyticsId(): Promise<string> {
  const next = createAnonymousId();
  await SecureStore.setItemAsync(ANONYMOUS_ID_KEY, next);
  return next;
}
