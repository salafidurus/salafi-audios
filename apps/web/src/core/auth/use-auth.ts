import { createUseAuth, createUseRequireAuth } from "@sd/auth-shared";
import { authClient } from "./auth-client";

export const useAuth = createUseAuth(authClient);
export const useRequireAuth = createUseRequireAuth(authClient);
