import { createQueryClient } from "@sd/core-contracts";
import { createSqlitePersister } from "./persister";

export const queryClient = createQueryClient();
export const persister = createSqlitePersister();
