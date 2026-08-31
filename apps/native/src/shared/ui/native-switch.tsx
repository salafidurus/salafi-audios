import { Host, Switch, type SwitchProps } from "@expo/ui";

/** Provides the shared controlled-switch boundary for native settings controls. */

/**
 * Controlled switch contract for settings and preference state.
 *
 * The caller remains authoritative for `value`; the native control may only
 * propose the next state through `onValueChange`.
 */
export type NativeSwitchProps = Omit<SwitchProps, "value" | "onValueChange"> & {
  /** React-owned checked state mirrored into the native switch. */
  value: boolean;
  /** Reports the next checked state without mutating caller-owned state. */
  onValueChange: (value: boolean) => void;
};

/** Renders a token-independent native switch while preserving controlled state. */
export function NativeSwitch({ value, onValueChange, ...props }: NativeSwitchProps) {
  return (
    <Host matchContents>
      <Switch {...props} value={value} onValueChange={onValueChange} />
    </Host>
  );
}
