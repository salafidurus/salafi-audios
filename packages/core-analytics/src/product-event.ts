import { z } from "zod";

/** Shared provider-neutral product-event schemas and privacy validation. */
/** Defines the runtime contract value for priority schema. */
export const ProductEventPrioritySchema = z.enum(["critical", "important", "best_effort"]);
/** Delivery class used to select retry and loss-tolerance policy downstream. */
export type ProductEventPriority = z.infer<typeof ProductEventPrioritySchema>;

/** Runtime identity shape for resettable anonymous and pseudonymous users. */
export const ProductEventIdentitySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("anonymous"), anonymous_id: z.string().min(1) }).strict(),
  z
    .object({
      type: z.literal("authenticated"),
      pseudonymous_id: z.string().min(1),
      anonymous_id: z.string().min(1).optional(),
    })
    .strict(),
]);
/** Identity carried by an event without exposing an authenticated database ID. */
export type ProductEventIdentity = z.infer<typeof ProductEventIdentitySchema>;

/** Consent classification carried with the event as it was observed. */
export const ProductEventConsentStateSchema = z.enum([
  "essential",
  "optional_granted",
  "optional_denied",
  "withdrawn",
]);
/** Event-time consent classification used by policy and downstream sinks. */
export type ProductEventConsentState = z.infer<typeof ProductEventConsentStateSchema>;

/** Event-time language, geography, runtime, and source-surface context. */
export const ProductEventContextSchema = z
  .object({
    interface_language: z.string().min(1).optional(),
    preferred_language: z.string().min(1).optional(),
    content_language: z.string().min(1).optional(),
    audio_language: z.string().min(1).optional(),
    country_code: z.string().length(2).optional(),
    coarse_region: z.string().min(1).optional(),
    timezone: z.string().min(1).optional(),
    source_surface: z.string().min(1).optional(),
    recommendation: z
      .object({
        request_id: z.string().min(1),
        surface: z.string().min(1),
        position: z.number().int().nonnegative(),
        candidate_set_id: z.string().min(1),
        recommendation_source: z.string().min(1),
        algorithm_version: z.string().min(1).optional(),
        experiment_id: z.string().min(1).optional(),
        feature_flag_state: z.record(z.string(), z.boolean()).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
/** Context captured when the product event occurred, not reconstructed later. */
export type ProductEventContext = z.infer<typeof ProductEventContextSchema>;

/** Stable client-safe content identities; internal database IDs are excluded. */
export const ProductEventContentReferencesSchema = z
  .object({
    listing_slug: z.string().min(1).optional(),
    scholar_slug: z.string().min(1).optional(),
  })
  .strict();
/** Stable public content references retained in historical product events. */
export type ProductEventContentReferences = z.infer<typeof ProductEventContentReferencesSchema>;

const EventTimestampSchema = z.iso.datetime({ offset: true });
const ListingViewedPropertiesSchema = z
  .object({
    listing_slug: z.string().min(1).optional(),
    scholar_slug: z.string().min(1).optional(),
  })
  .strict();
const AudioCompletedPropertiesSchema = z
  .object({
    completion_source: z.literal("progress_persisted"),
  })
  .strict();

const CommonEventFields = {
  event_id: z.string().min(1),
  schema_version: z.string().regex(/^v\d+$/, "Schema versions must use the vN format"),
  occurred_at: EventTimestampSchema,
  received_at: EventTimestampSchema,
  app_version: z.string().min(1),
  consent_state: ProductEventConsentStateSchema,
  identity: ProductEventIdentitySchema,
  event_context: ProductEventContextSchema,
  content_references: ProductEventContentReferencesSchema,
  priority: ProductEventPrioritySchema,
};

/** Typed client-owned observation of a listing being viewed. */
const ListingViewedEventSchema = z
  .object({
    ...CommonEventFields,
    event_name: z.literal("listing_viewed"),
    source: z.literal("web"),
    platform: z.literal("web"),
    content_references: z
      .object({ listing_slug: z.string().min(1), scholar_slug: z.string().min(1) })
      .strict(),
    authority: z.literal("client_observation"),
    producer: z.literal("web"),
    properties: ListingViewedPropertiesSchema,
  })
  .strict();

/** Typed backend-confirmed outcome produced after a persisted completion. */
const AudioCompletedEventSchema = z
  .object({
    ...CommonEventFields,
    event_name: z.literal("audio_completed"),
    source: z.literal("api"),
    platform: z.enum(["web", "ios", "android"]),
    content_references: z
      .object({ listing_slug: z.string().min(1), scholar_slug: z.string().min(1) })
      .strict(),
    authority: z.literal("backend_confirmed"),
    producer: z.literal("api"),
    properties: AudioCompletedPropertiesSchema,
  })
  .strict();

/** The provider-neutral, immutable event union shared by future producers. */
export const ProductEventSchema = z
  .discriminatedUnion("event_name", [ListingViewedEventSchema, AudioCompletedEventSchema])
  .superRefine((event, context) => {
    const serialized = JSON.stringify(event);
    if (serialized.length > 64 * 1024) {
      context.addIssue({
        code: "custom",
        message: "Product events must not exceed 64 KiB",
        path: ["properties"],
      });
    }

    const forbiddenNames = new Set([
      "email",
      "password",
      "token",
      "cookie",
      "authorization",
      "raw_search_query",
      "raw_search_text",
      "search_query",
      "search_text",
      "user_id",
      "keystroke",
      "keystrokes",
      "latitude",
      "longitude",
      "exact_location",
    ]);

    for (const forbiddenName of forbiddenNames) {
      if (serialized.includes(`"${forbiddenName}":`)) {
        context.addIssue({
          code: "custom",
          message: `Forbidden product-event property: ${forbiddenName}`,
          path: ["properties"],
        });
      }
    }
  });

/** Alias documenting that this union is the complete canonical envelope. */
export const CanonicalProductEventSchema = ProductEventSchema;
/** Deeply immutable event value safe to pass between producers and adapters. */
export type CanonicalProductEvent = Readonly<z.infer<typeof CanonicalProductEventSchema>>;
/** Mutable parsed shape used when a caller is constructing an event value. */
export type ProductEvent = z.infer<typeof ProductEventSchema>;

type ProductEventInput = z.input<typeof CanonicalProductEventSchema>;

function deepFreeze<T extends object>(value: T): T {
  if (Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }
  return value;
}

/**
 * Validates contract input and returns a deeply immutable canonical event.
 * Invalid event names, fields, privacy violations, and oversized payloads
 * throw the standard Zod validation error for the caller to handle.
 */
export function parseProductEvent(input: ProductEventInput): CanonicalProductEvent {
  return deepFreeze(CanonicalProductEventSchema.parse(input));
}
