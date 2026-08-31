import { NativeSwitch } from "@/shared/ui/native-switch";

/** Preserves the legacy toggle entry point while native settings migrate. */

/**
 * Compatibility props for boolean settings that still use the legacy
 * `checked`/`onChange` vocabulary.
 */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Delegates the legacy toggle API to the canonical controlled switch. */
export function Toggle({
  checked,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
}: ToggleProps) {
  return (
    <NativeSwitch
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      label={ariaLabel}
      testID="toggle-switch"
    />
  );
}
