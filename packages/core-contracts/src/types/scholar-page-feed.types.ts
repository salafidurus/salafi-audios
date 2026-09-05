import { z } from "zod";

import { ScholarListItemDtoSchema, ScholarContentItemDtoSchema } from "./scholar.types";

/**
 * Identifies the first stable wire shape so clients can reject incompatible
 * root Scholars responses before rendering them.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the version invariant is documented in the block above.
export const ScholarPageFeedSchemaVersion = 1 as const;

/** The supported title context for the initial deterministic Scholars batch. */
export const ScholarPageFeedAllamahTitleContextSchema = z.object({
  kind: z.literal("allamah"),
  id: z.literal("allamah_scholars"),
  label: z.string().min(1),
});

/** Localized title context used to present the Allamah scholar batch. */
export type ScholarPageFeedAllamahTitleContext = z.infer<
  typeof ScholarPageFeedAllamahTitleContextSchema
>;

/** The initial semantic Scholars page-feed batch form. */
export const ScholarPageFeedScholarsBatchSchema = z.object({
  form: z.literal("scholars"),
  id: z.string().min(1),
  title: ScholarPageFeedAllamahTitleContextSchema,
  items: z.array(ScholarListItemDtoSchema),
});

/** Ordered, fully hydrated Allamah scholars selected for the root page. */
export type ScholarPageFeedScholarsBatch = z.infer<typeof ScholarPageFeedScholarsBatchSchema>;

/** The title context for a scholar's recommended catalog listings. */
export const ScholarPageFeedScholarListingsTitleContextSchema = z.object({
  kind: z.literal("scholar_listings"),
  id: z.literal("scholar_listings"),
  label: z.string().min(1),
});

/** Localized title context used to present a scholar listings batch. */
export type ScholarPageFeedScholarListingsTitleContext = z.infer<
  typeof ScholarPageFeedScholarListingsTitleContextSchema
>;

/** Ordered catalog listings associated with one recommended scholar. */
export const ScholarPageFeedScholarListingsBatchSchema = z.object({
  form: z.literal("scholar_listings"),
  id: z.string().min(1),
  scholarSlug: z.string().min(1),
  title: ScholarPageFeedScholarListingsTitleContextSchema,
  scholar: ScholarListItemDtoSchema,
  items: z.array(ScholarContentItemDtoSchema),
});

/** Fully hydrated scholar and listings selected for one page-feed batch. */
export type ScholarPageFeedScholarListingsBatch = z.infer<
  typeof ScholarPageFeedScholarListingsBatchSchema
>;

/** The title context for scholars recommended through a selected topic. */
export const ScholarPageFeedTopicScholarsTitleContextSchema = z.object({
  kind: z.literal("topic_scholars"),
  id: z.literal("topic_scholars"),
  label: z.string().min(1),
});

/** Localized title context used to present a topic scholars batch. */
export type ScholarPageFeedTopicScholarsTitleContext = z.infer<
  typeof ScholarPageFeedTopicScholarsTitleContextSchema
>;

/** Public topic identity and request-locale name required by the Scholars page. */
export const ScholarPageFeedTopicItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
});

/** Topic identity paired with its localized presentation name. */
export type ScholarPageFeedTopicItem = z.infer<typeof ScholarPageFeedTopicItemSchema>;

/** Ordered active scholars associated with one recommended topic. */
export const ScholarPageFeedTopicScholarsBatchSchema = z.object({
  form: z.literal("topic_scholars"),
  id: z.string().min(1),
  topicSlug: z.string().min(1),
  title: ScholarPageFeedTopicScholarsTitleContextSchema,
  topic: ScholarPageFeedTopicItemSchema,
  items: z.array(ScholarListItemDtoSchema),
});

/** Fully hydrated topic and scholars selected for one page-feed batch. */
export type ScholarPageFeedTopicScholarsBatch = z.infer<
  typeof ScholarPageFeedTopicScholarsBatchSchema
>;

/** Versioned public response for the root Scholars page. */
export const ScholarPageFeedDtoSchema = z.object({
  schemaVersion: z.literal(ScholarPageFeedSchemaVersion),
  batches: z.array(
    z.union([
      ScholarPageFeedScholarsBatchSchema,
      ScholarPageFeedScholarListingsBatchSchema,
      ScholarPageFeedTopicScholarsBatchSchema,
    ]),
  ),
  exhausted: z.boolean(),
});

/** Fully hydrated semantic batches for the root Scholars page. */
export type ScholarPageFeedDto = z.infer<typeof ScholarPageFeedDtoSchema>;

const ScholarPageFeedCompatibilitySchema = z.object({
  schemaVersion: z.literal(ScholarPageFeedSchemaVersion),
  batches: z.array(z.unknown()),
  exhausted: z.boolean(),
});

/**
 * Parses a Scholars page feed while ignoring unsupported future batch forms.
 * Supported batches remain ordered and invalid supported shapes still fail at
 * the shared response boundary.
 */
// oxlint-disable-next-line anti-slop/no-unknown-parameters -- the parser is intentionally the untrusted I/O boundary.
export function parseScholarPageFeedDto(input: unknown): ScholarPageFeedDto {
  const page = ScholarPageFeedCompatibilitySchema.parse(input);
  const batches = page.batches.flatMap((batch): ScholarPageFeedDto["batches"] => {
    const scholarBatch = ScholarPageFeedScholarsBatchSchema.safeParse(batch);
    if (scholarBatch.success) return [scholarBatch.data];
    const listingsBatch = ScholarPageFeedScholarListingsBatchSchema.safeParse(batch);
    if (listingsBatch.success) return [listingsBatch.data];
    const topicBatch = ScholarPageFeedTopicScholarsBatchSchema.safeParse(batch);
    return topicBatch.success ? [topicBatch.data] : [];
  });

  return ScholarPageFeedDtoSchema.parse({ ...page, batches });
}
