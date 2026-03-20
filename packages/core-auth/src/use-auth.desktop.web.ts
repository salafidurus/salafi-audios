import { createUseAuth, createUseRequireAuth } from "./use-require-auth";
import { authClient } from "./auth-client";

export const useAuth = createUseAuth(authClient);
export const useRequireAuth = createUseRequireAuth(authClient);
