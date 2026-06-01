import { useSyncExternalStore } from "react";

// No-op subscription — hydration state only changes once and needs no listener.
const subscribe = () => () => {};

/**
 * Returns true once the component has hydrated on the client.
 * Safe to use in SSR contexts: returns false on the server and on the
 * initial client render, then true after hydration.
 *
 * Use this instead of `useState(false) + useEffect(() => setState(true), [])`,
 * which triggers the react-hooks/set-state-in-effect lint rule.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
