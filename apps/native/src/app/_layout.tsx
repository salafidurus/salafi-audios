import { Stack } from "expo-router";
import { Providers } from "../core/providers";
import { getWrappedLayout } from "@/core/integrations";
import { MiniPlayer } from "@/features/audio";

function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(content)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <MiniPlayer />
    </Providers>
  );
}

export default getWrappedLayout( RootLayout );
