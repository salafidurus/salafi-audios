"use client";

import { AppText } from "@/shared/components/AppText/AppText";

type Props = {
  children: string;
};

export function TitleTextDesktop({ children }: Props) {
  return <AppText variant="displayMd">{children}</AppText>;
}
