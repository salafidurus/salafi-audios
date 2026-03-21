import { createUseAuth, createUseRequireAuth } from "./use-require-auth";
import { authClient } from "../utils/auth-client.web";

export const useAuth = createUseAuth(authClient);
export const useRequireAuth = createUseRequireAuth(authClient);
