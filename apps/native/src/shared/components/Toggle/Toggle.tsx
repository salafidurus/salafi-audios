import type { ReactNode } from "react";

import { Host, Switch } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

/** Provides the native shared components Toggle Toggle module responsibility. */
/** Describes the ToggleProps native interface contract and behavior. */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Describes the Toggle native function contract and behavior. */
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
