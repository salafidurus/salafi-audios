import Constants from "expo-constants";
import { parseMobileRuntimeExtra } from "@sd/env";

const extra = Constants.expoConfig?.extra;
export const mobileEnv = parseMobileRuntimeExtra(extra);
