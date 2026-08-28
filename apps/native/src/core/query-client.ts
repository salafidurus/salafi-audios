import { createQueryClient } from "@sd/core-contracts";

/** Provides shared native runtime infrastructure used by feature modules. */
/** Creates the shared query client used for native server-state caching. */
export const queryClient = createQueryClient();
