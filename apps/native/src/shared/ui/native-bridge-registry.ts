export type ApprovedNativeBridge = {
  file: string;
  reason: string;
};

export const APPROVED_NATIVE_BRIDGES: readonly ApprovedNativeBridge[] = [
  {
    file: "src/core/providers.tsx",
    reason:
      "Provider bootstrap requires React Native gesture, keyboard, and keyed direction roots.",
  },
  {
    file: "src/shared/ui/native-image.tsx",
    reason:
      "Expo UI has no universal remote-image primitive, so expo-image is hosted through RNHostView.",
  },
  {
    file: "src/shared/components/DraggableList.tsx",
    reason:
      "The reorder gesture shell requires React Native Gesture Handler and Reanimated infrastructure.",
  },
  {
    file: "src/features/navigation/components/BottomAccessory/BottomAccessory.tsx",
    reason:
      "The package-owned native bottom-accessory module exposes a React Native mounting boundary.",
  },
  {
    file: "src/features/audio/components/playback-controls.tsx",
    reason:
      "PlaybackControls mixes RN Pressable/View controls with NativeText (Compose TextView) for speed and skip labels — NativeBridgeHost inlines the Compose boundary.",
  },
  {
    file: "src/features/downloads/components/download-button/download-button.tsx",
    reason:
      "DownloadButton pill uses RN Pressable/View for touch handling with NativeText (Compose TextView) for status labels — NativeBridgeHost inlines the Compose boundary.",
  },
] as const;
