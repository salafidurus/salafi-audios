import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Shared class boundary used by shadcn primitives and app-owned components. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
