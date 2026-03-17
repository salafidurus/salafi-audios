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
    lineHeight: theme.typography.displayMd.lineHeight,
    color: theme.colors.content.strong,
    _web: {
      fontSize: theme.typography.displayMd.fontSize,
      letterSpacing: theme.typography.displayMd.letterSpacing,
      fontWeight: theme.typography.displayMd.fontWeight,
    },
  },
}));
