import { AppText } from "@sd/shared";

export type TitleTextMobileWebProps = {
  children: string;
  delay?: number;
};

export function TitleTextMobileWeb({ children }: TitleTextMobileWebProps) {
  return <AppText variant="displayMd">{children}</AppText>;
}
