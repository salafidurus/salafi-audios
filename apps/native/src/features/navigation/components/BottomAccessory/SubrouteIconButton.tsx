/** Provides the accessible native control that reveals subsection navigation. */
import { Button, RNHostView } from "@expo/ui";
import React from "react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeIcon } from "@/shared/ui";

/** Carries the action invoked when the subsection disclosure control is activated. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export type SubrouteIconButtonProps = {
  onPress: () => void;
};

/** Renders the accessible control that reveals the current section's subroutes. */
export function SubrouteIconButton({ onPress }: SubrouteIconButtonProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  // SAFETY: Button forwards these accessibility fields to the platform control.
  const accessibilityProps = {
    accessibilityRole: "button",
    accessibilityLabel: t("navigation.show_subroutes", "Show section subroutes"),
  } as any;

  return (
    <RNHostView style={/* SAFETY: explicit RN bridge style */ styles.container as any}>
      <Button
        onPress={onPress}
        {...accessibilityProps}
        style={/* SAFETY: native button accepts token-backed style */ styles.button as any}
        testID="subroute-icon-button"
      >
        <NativeIcon name="more" size={20} color={theme.colors.content.strong} />
      </Button>
    </RNHostView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.default,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.sm,
  },
}));
