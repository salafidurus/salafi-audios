import { AppText } from "@sd/shared";

export type TitleTextProps = {
  children: string;
  delay?: number;
};

export function TitleText({ children }: TitleTextProps) {
  return <AppText variant="displayMd">{children}</AppText>;
}
