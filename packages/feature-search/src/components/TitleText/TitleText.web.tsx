import { Text } from "react-native";
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
    color: theme.colors.content.strong,
    _web: {
      ...theme.typography.displayMd,
      lineHeight: String(theme.typography.displayMd.lineHeight),
    },
  },
}));
