import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { getApiBaseUrl } from "../config/runtime-env";

const rawScheme = Constants.expoConfig?.scheme;
const scheme = Array.isArray(rawScheme) ? rawScheme[0] : (rawScheme ?? "salafidurus");

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl() ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000",
  plugins: [
    expoClient({
      scheme,
      storage: SecureStore,
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
