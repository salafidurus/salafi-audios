/** Documents this module's responsibility and public boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The module-level responsibility is documented above.
import type { NativeAnalyticsRecorder } from "./recorder";

let activeRecorder: NativeAnalyticsRecorder | undefined;

/** Registers the app-scoped recorder once native analytics is initialized. */
export function setNativeAnalyticsRecorder(recorder: NativeAnalyticsRecorder | undefined): void {
  activeRecorder = recorder;
}

/** Returns the initialized recorder for feature-level product observations. */
export function getNativeAnalyticsRecorder(): NativeAnalyticsRecorder | undefined {
  return activeRecorder;
}
