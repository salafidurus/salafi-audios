import type { ReactNode } from "react";

import { Switch } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps): ReactNode {
  const { theme } = useUnistyles();

  return (
    <Switch
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{
        false: theme.colors.surface.hover,
        true: theme.colors.action.primary,
      }}
      thumbColor={theme.colors.surface.default}
    />
  );
}
