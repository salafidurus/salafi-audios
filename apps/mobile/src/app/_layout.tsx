import { ProvidersMobileNative } from "../providers";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <ProvidersMobileNative>
      <Slot />
    </ProvidersMobileNative>
  );
}
