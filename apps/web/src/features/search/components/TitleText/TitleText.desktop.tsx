"use client";

import { AppText } from "@sd/shared";

type Props = {
  children: string;
};

export function TitleTextDesktopWeb({ children }: Props) {
  return <AppText variant="displayMd">{children}</AppText>;
}
