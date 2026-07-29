import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getWrappedLayout } from "@/core/integrations";
import { MiniPlayer } from "@/features/audio";

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
      <MiniPlayer />
    </Providers>
  );
}

const WrappedLayout = getWrappedLayout(RootLayout);
export default WrappedLayout;
