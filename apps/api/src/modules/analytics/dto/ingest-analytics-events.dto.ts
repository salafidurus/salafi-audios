import { z } from 'zod';
import { CanonicalProductEventSchema } from '@sd/core-analytics';

/** Validates the bounded analytics ingestion envelope before it reaches application policy. */
export const IngestAnalyticsEventsDtoSchema = z
  .strictObject({
    events: z.array(CanonicalProductEventSchema).min(1).max(20),
  })
  .superRefine((body, context) => {
    const serialized = JSON.stringify(body);
    if (Buffer.byteLength(serialized, 'utf8') > 256 * 1024) {
      context.addIssue({ code: 'custom', message: 'Analytics payload must not exceed 256 KiB' });
    }

    const ids = new Set<string>();
    for (const [index, event] of body.events.entries()) {
      if (ids.has(event.event_id)) {
        context.addIssue({
          code: 'custom',
          path: ['events', index, 'event_id'],
          message: 'Analytics event IDs must be unique within a request',
        });
      }
      ids.add(event.event_id);
    }
  });

/** Parsed analytics ingestion request. */
export type IngestAnalyticsEventsDto = z.infer<typeof IngestAnalyticsEventsDtoSchema>;
