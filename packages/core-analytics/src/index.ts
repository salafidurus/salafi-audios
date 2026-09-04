/** Public provider-neutral product analytics contracts. */
export {
  CanonicalProductEventSchema,
  ProductEventConsentStateSchema,
  ProductEventContextSchema,
  ProductEventContentReferencesSchema,
  ProductEventIdentitySchema,
  ProductEventPrioritySchema,
  ProductEventSchema,
  parseProductEvent,
} from "./product-event";
export type {
  CanonicalProductEvent,
  ProductEvent,
  ProductEventConsentState,
  ProductEventContext,
  ProductEventContentReferences,
  ProductEventIdentity,
  ProductEventPriority,
} from "./product-event";
