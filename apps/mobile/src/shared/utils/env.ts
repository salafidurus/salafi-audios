import Constants from "expo-constants";
import { parseMobileRuntimeExtra } from "@sd/env/mobile";

const extra = Constants.expoConfig?.extra;
export const mobileEnv = parseMobileRuntimeExtra(extra);
