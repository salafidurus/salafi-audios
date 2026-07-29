import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getWrappedLayout } from "@/core/integrations";
import { BottomAccessory } from "@/features/navigation";

import { Providers } from "../core/providers";

function RootLayout() {
  return (
    <Providers>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(content)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <BottomAccessory />
    </Providers>
  );
}

const WrappedLayout = getWrappedLayout(RootLayout);
export default WrappedLayout;
