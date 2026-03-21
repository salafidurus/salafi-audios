"use client";

import { Providers as SharedProviders } from "@sd/shared";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
};

export function Providers({ children, apiBaseUrl }: Props) {
  return <SharedProviders apiBaseUrl={apiBaseUrl}>{children}</SharedProviders>;
}
