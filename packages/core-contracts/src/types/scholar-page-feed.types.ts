import { z } from "zod";

import { ScholarListItemDtoSchema } from "./scholar.types";

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

/** Versioned public response for the root Scholars page. */
export const ScholarPageFeedDtoSchema = z.object({
  schemaVersion: z.literal(ScholarPageFeedSchemaVersion),
  batches: z.array(ScholarPageFeedScholarsBatchSchema),
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
  const batches = page.batches.flatMap((batch) => {
    const parsed = ScholarPageFeedScholarsBatchSchema.safeParse(batch);
    return parsed.success ? [parsed.data] : [];
  });

  return ScholarPageFeedDtoSchema.parse({ ...page, batches });
}
