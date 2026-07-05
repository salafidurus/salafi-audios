import { AppText } from "@/shared/components/AppText/AppText";

export type TitleTextMobileProps = {
  children: string;
  delay?: number;
};

export function TitleTextMobile({ children }: TitleTextMobileProps) {
  return <AppText variant="displayMd">{children}</AppText>;
}
