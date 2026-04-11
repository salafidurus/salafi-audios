import { AppText } from "../../../../shared/components/AppText/AppText";

export type TitleTextProps = {
  children: string;
  delay?: number;
};

export function TitleText({ children }: TitleTextProps) {
  return <AppText variant="displayMd">{children}</AppText>;
}
