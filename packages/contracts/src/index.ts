// Export HTTP client
export { configureApiClient, httpClient } from "@/http";
export type { HttpClientConfig } from "@/http";

// Export endpoint constants
export { endpoints } from "@/endpoints";

// Export all shared types
export * from "@/types";

// Export query utilities (client, keys, hooks)
export { createQueryClient, queryKeys } from "@/query";
export { useApiQuery, initApiClient } from "@/query/hooks";

// Export all React Query hooks for convenience
export { useQuery, useMutation } from "@/query/hooks";
