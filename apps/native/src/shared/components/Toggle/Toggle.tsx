import type { ReactNode } from "react";

import { Host, Switch } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by Toggle. */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Renders the native toggle surface and coordinates its user-facing state. */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: ToggleProps): ReactNode {
  const { theme } = useUnistyles();

  return (
    <Host matchContents seedColor={theme.colors.action.primary} accessibilityLabel={ariaLabel}>
      <Switch value={checked} onValueChange={onChange} disabled={disabled} testID="toggle-switch" />
    </Host>
  );
}
