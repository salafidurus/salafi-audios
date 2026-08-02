import * as Network from "expo-network";

/**
 * Fires `callback` whenever connectivity transitions from disconnected to
 * connected (not on every network event) — used to trigger an outbox drain
 * on reconnect. Treats the pre-first-event state as disconnected, so the
 * very first "connected" event does count as a reconnect. Returns an
 * unsubscribe function.
 */
export function onNetworkReconnect(callback: () => void): () => void {
  let wasConnected = false;

  const subscription = Network.addNetworkStateListener((event) => {
    const isConnected = !!event.isConnected;
    if (!wasConnected && isConnected) {
      callback();
    }
    wasConnected = isConnected;
  });

  return () => subscription.remove();
}
