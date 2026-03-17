import { Text } from "react-native-unistyles/components/native/Text";
import { StyleSheet } from "react-native-unistyles";

export type TitleTextProps = {
  children: string;
  delay?: number;
};

export function TitleText({ children }: TitleTextProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.typography.displayMd.fontFamily,
    fontSize: theme.typography.displayMd.fontSize,
    lineHeight: theme.typography.displayMd.lineHeight,
    letterSpacing: theme.typography.displayMd.letterSpacing,
    color: theme.colors.content.strong,
  },
}));
