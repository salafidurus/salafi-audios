/** Defines the curated home-screen constants for mobile availability and featured scholars. */

/** Describes which mobile app distribution links the home screen may expose. */
export type MobileAvailability = false | "ios" | "android" | "both";

// Flip this when an app store listing goes live.
/** Current availability flag used to hide unavailable mobile download actions. */
export const MOBILE_APP_AVAILABILITY: MobileAvailability = false;

/** iOS App Store URL, or undefined while the iOS listing is unavailable. */
export const APP_STORE_URL: string | undefined = undefined;
/** Google Play URL, or undefined while the Android listing is unavailable. */
export const GOOGLE_PLAY_URL: string | undefined = undefined;

// Explicit editorial curation; this is intentionally not inferred from title,
// lecture count, popularity, or the API response order.
/** Stable scholar slug used by the featured senior-scholar home section. */
export const FEATURED_SENIOR_SCHOLAR_SLUG = "fawzan";
