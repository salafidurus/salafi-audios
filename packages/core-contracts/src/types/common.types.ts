import { z } from "zod";

/** Primitive status, pagination, and error-response contracts reused across API DTOs. */
/** Defines the runtime contract value for status values. */
export const STATUS_VALUES = ["draft", "review", "published", "archived"] as const;
/** Defines the runtime contract value for status value schema. */
export const StatusValueSchema = z.enum(STATUS_VALUES);
/** Defines the contract type for status value. */
export type StatusValue = z.infer<typeof StatusValueSchema>;

/** Defines the runtime contract value for pagination params schema. */
export const PaginationParamsSchema = z.object({
  limit: z.number().optional(),
  cursor: z.string().optional(),
});
/** Defines the contract type for pagination params. */
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/** Defines the runtime contract value for error response dto schema. */
export const ErrorResponseDtoSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  timestamp: z.string(),
});
/** Defines the contract type for error response dto. */
export type ErrorResponseDto = z.infer<typeof ErrorResponseDtoSchema>;
