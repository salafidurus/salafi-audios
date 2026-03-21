import { StyleSheet } from "react-native-unistyles";
import { Text } from "react-native-unistyles/components/native/Text";

export type TitleTextMobileWebProps = {
  children: string;
  delay?: number;
};

export function TitleTextMobileWeb({ children }: TitleTextMobileWebProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create((theme) => ({
  title: {
    color: theme.colors.content.primary,
    _web: {
      ...theme.typography.displayMd,
      lineHeight: String(theme.typography.displayMd.lineHeight),
    },
  },
}));
