import { clsx, type ClassValue } from "clsx";

/** Shared class boundary used by shadcn primitives and app-owned components. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
