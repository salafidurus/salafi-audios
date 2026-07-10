"use client";

import { createContext, useContext } from "react";
import type { DropdownContextValue } from "./types";

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error("Dropdown compound components must be used within <Dropdown>");
  }
  return ctx;
}

export { DropdownContext };
