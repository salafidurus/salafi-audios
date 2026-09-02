import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Defines the shared class-name composition boundary for the web UI. */
/** Combines conditional class values and resolves conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
