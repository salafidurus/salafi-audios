import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type TitleTextProps = {
  children: string;
};

export function TitleText({ children }: TitleTextProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.typography.titleLg.fontFamily,
    fontSize: theme.typography.displayLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    letterSpacing: theme.typography.titleLg.letterSpacing,
    color: theme.colors.content.primaryStrong,
  },
}));
