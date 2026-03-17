import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useEffect, useState } from "react";

export type TitleTextProps = {
  children: string;
  delay?: number;
};

export function TitleText({ children, delay = 0 }: TitleTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <EaseView
      initialAnimate={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, translateY: isVisible ? 0 : 20 }}
      transition={{ type: "spring", damping: 12, stiffness: 100 }}
    >
      <Text style={styles.title}>{children}</Text>
    </EaseView>
  );
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
