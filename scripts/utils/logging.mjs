/**
 * Prefixed logger utilities for deployment steps.
 */

export function log(message) {
  console.log(`[Deploy] ${message}`);
}

export function error(message) {
  console.error(`[Deploy] Error: ${message}`);
}

export function warn(message) {
  console.warn(`[Deploy] Warning: ${message}`);
}
