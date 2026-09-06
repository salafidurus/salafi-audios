/** Exposes the web analytics buffer, recorder, and delivery seams. */
export { AnalyticsBuffer } from "./analytics-buffer";
export {
  createWebAnalyticsRecorder,
  subscribeWebAnalytics,
  webAnalytics,
  webAnalyticsBuffer,
} from "./web-analytics";
export { flushWebAnalytics } from "./web-analytics-delivery";
export type { AnalyticsBufferOptions, BufferedAnalyticsEvent } from "./analytics-buffer";
export type { WebAnalyticsContentReferences, WebAnalyticsRecorder } from "./web-analytics";
