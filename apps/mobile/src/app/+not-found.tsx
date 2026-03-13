import { Href, Link, Stack } from "expo-router";

import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{"This screen doesn't exist."}</Text>
        <Link href={"/(tabs)" as Href} style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.layout.pageX,
  },
  title: {
    fontFamily: theme.typography.titleLg.fontFamily,
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    letterSpacing: theme.typography.titleLg.letterSpacing,
    color: theme.colors.content.strong,
  },
  link: {
    marginTop: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.lg,
  },
  linkText: {
    fontFamily: theme.typography.bodySm.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    lineHeight: theme.typography.bodySm.lineHeight,
    letterSpacing: theme.typography.bodySm.letterSpacing,
    color: theme.colors.content.primary,
  },
}));
