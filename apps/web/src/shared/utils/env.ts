import { getWebPublicEnv } from "@sd/env/web";

/**
 * Web environment (client-safe).
 * Evaluated once per module load.
 */
export const webEnv = getWebPublicEnv();
