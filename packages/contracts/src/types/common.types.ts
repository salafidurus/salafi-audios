export const STATUS_VALUES = ["draft", "review", "published", "archived"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];

export type PaginationParams = {
  limit?: number;
  cursor?: string;
};

export type ErrorResponseDto = {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
};
