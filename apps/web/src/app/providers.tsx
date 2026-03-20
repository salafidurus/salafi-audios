"use client";

import { Providers as SharedProviders } from "@sd/shared";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return <SharedProviders>{children}</SharedProviders>;
}
