"use client";

import { AppText } from "../../../../shared/components/AppText/AppText";

type Props = {
  children: string;
};

export function TitleTextDesktopWeb({ children }: Props) {
  return <AppText variant="displayMd">{children}</AppText>;
}
