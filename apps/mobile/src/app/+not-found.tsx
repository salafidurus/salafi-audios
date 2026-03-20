import { Href, Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button, ScreenView } from "@sd/shared";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ScreenView center contentStyle={styles.content}>
        <View style={styles.group}>
          <Text style={styles.title}>{"Page not found"}</Text>
          <Text style={styles.subtitle}>
            {"The desired screen doesn't exist or may have moved."}
          </Text>
        </View>
        <View style={styles.group}>
          <Button
            variant="primary"
            size="md"
            label="Return to home screen"
            onPress={() => router.replace("/(tabs)" as Href)}
            style={styles.button}
          />
        </View>
      </ScreenView>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.component.gapXl,
  },
  group: {
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  title: {
    ...theme.typography.displayMd,
    color: theme.colors.content.strong,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
  },
}));
