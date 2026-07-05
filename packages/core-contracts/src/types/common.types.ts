import { z } from "zod";

export const STATUS_VALUES = ["draft", "review", "published", "archived"] as const;
export const StatusValueSchema = z.enum(STATUS_VALUES);
export type StatusValue = z.infer<typeof StatusValueSchema>;

export const PaginationParamsSchema = z.object({
  limit: z.number().optional(),
  cursor: z.string().optional(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const ErrorResponseDtoSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
  timestamp: z.string(),
});
export type ErrorResponseDto = z.infer<typeof ErrorResponseDtoSchema>;
