import Constants from "expo-constants";
import { parseMobileRuntimeExtra } from "@sd/env";

const extra = Constants.expoConfig?.extra;

export const mobileEnv = parseMobileRuntimeExtra(extra);

export const isDev = mobileEnv.appEnv === "development";
export const isPreview = mobileEnv.appEnv === "preview";
export const isProduction = mobileEnv.appEnv === "production";

export function getApiBaseUrl(): string {
  return mobileEnv.apiUrl;
}
