/** Defines the approved visual boundaries between Expo UI and React Native. */
/** Metadata used to justify and later remove a visual React Native bridge. */
export type NativeBridgeMetadata = {
  file: string;
  /** Distinguishes an Expo UI/RN crossing from approved RN-only infrastructure. */
  kind: "bridge" | "infrastructure";
  reason: string;
  owner: string;
  validationEvidence: string;
  temporary?: boolean;
  removalCondition?: string;
};

/** Backward-compatible name for the complete native bridge metadata contract. */
export type ApprovedNativeBridge = NativeBridgeMetadata;

/** Records the deliberate visual RN boundaries that the migration must preserve. */
export const APPROVED_NATIVE_BRIDGES: readonly ApprovedNativeBridge[] = [
  {
    file: "src/shared/ui/native-image.tsx",
    kind: "bridge",
    reason: "Expo UI has no universal remote-image primitive.",
    owner: "native UI foundation",
    validationEvidence: "NativeImage contract test and Android host validation",
  },
  {
    file: "src/shared/ui/native-ui-host.tsx",
    kind: "bridge",
    reason: "NativeBridgeHost embeds an explicitly React Native child subtree inside Expo UI.",
    owner: "native UI foundation",
    validationEvidence: "NativeBridgeHost composition test and Android host validation",
  },
  {
    file: "src/shared/components/List/ListItem.tsx",
    kind: "bridge",
    reason: "ListItem keeps rich leading, trailing, and action content in explicit RN host slots.",
    owner: "native UI foundation",
    validationEvidence: "ListItem contract tests and Android list host validation",
  },
  {
    file: "src/features/auth/screens/sign-in/sign-in.screen.tsx",
    kind: "bridge",
    reason:
      "Apple authentication is an iOS-only native control hosted inside the Expo UI sign-in surface.",
    owner: "auth feature owner",
    validationEvidence: "Sign-in screen contract tests and Android host validation",
  },
  {
    file: "src/features/navigation/components/BottomAccessory/BottomAccessory.tsx",
    kind: "bridge",
    reason:
      "The package-owned bottom accessory is mounted through the React Native navigation boundary.",
    owner: "navigation feature owner",
    validationEvidence: "Bottom accessory contract tests and Android host validation",
  },
  {
    file: "src/shared/components/DraggableList.tsx",
    kind: "infrastructure",
    reason: "Reordering requires React Native gesture and animation infrastructure.",
    owner: "listing and library feature owners",
    validationEvidence: "Existing draggable-list behavior tests and Android validation",
  },
  {
    file: "src/shared/components/MarqueeText/MarqueeText.tsx",
    kind: "infrastructure",
    reason: "Marquee behavior requires React Native measurement and animation infrastructure.",
    owner: "audio feature owner",
    validationEvidence: "Existing marquee behavior tests and Android validation",
  },
  {
    file: "src/shared/components/AccentGradientFill/AccentGradientFill.tsx",
    kind: "infrastructure",
    reason: "Gradient rendering requires the existing SVG capability.",
    owner: "native UI foundation",
    validationEvidence: "Existing gradient rendering tests and Android validation",
  },
  {
    file: "src/core/providers.tsx",
    kind: "infrastructure",
    reason: "Application bootstrap owns React Native gesture, keyboard, and direction providers.",
    owner: "native platform bootstrap",
    validationEvidence: "Provider integration tests and Android launch validation",
  },
] as const;
