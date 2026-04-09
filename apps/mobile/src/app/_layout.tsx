import type { ErrorBoundaryProps } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { ProvidersMobileNative } from "../core/providers";
import { Slot } from "expo-router";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ProvidersMobileNative>
      <Slot />
    </ProvidersMobileNative>
  );
}
