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
] as const;
