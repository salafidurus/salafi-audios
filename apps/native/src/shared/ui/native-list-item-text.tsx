import type { TypographyVariant } from "@sd/design-tokens";

import { Text as ComposeText } from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useUnistyles } from "react-native-unistyles";

/** Provides Compose-native text for semantic Expo UI list slots. */
/**
 * Renders string content as a Jetpack Compose text node for an Expo UI list
 * slot. The selected semantic color and typography variant stay synchronized
 * with the active native theme; an optional test ID is attached through the
 * Compose modifier system rather than an intervening React Native view.
 */
export function ListItemText({
  children,
  colorRole,
  variant = "bodyMd",
  testID,
}: {
  children: string | number;
  /** Selects the semantic color token used by the Compose text node. */
  colorRole: "strong" | "muted";
  variant?: TypographyVariant;
  testID?: string;
}) {
  const { theme } = useUnistyles();
  return (
    <ComposeText
      color={colorRole === "strong" ? theme.colors.content.strong : theme.colors.content.muted}
      style={theme.typography[variant]}
      modifiers={testID ? [testIDModifier(testID)] : undefined}
    >
      {String(children)}
    </ComposeText>
  );
}
