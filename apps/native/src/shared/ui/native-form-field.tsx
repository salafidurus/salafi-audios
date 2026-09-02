import { Column, Host, TextInput, useNativeState, type TextInputProps } from "@expo/ui";
import { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

import { NativeText } from "./native-text";

/** Defines a controlled native field with explicit validation presentation. */
/** Caller-owned value and field feedback rendered around the native input. */
export type NativeFormFieldProps = Omit<TextInputProps, "defaultValue" | "value"> & {
  label: string;
  value: string;
  helperText?: string;
  /** Recoverable validation feedback that takes precedence over helper text. */
  error?: string;
};

/** Synchronizes React authority into Expo UI observable native state. */
export function NativeFormField({
  label,
  value,
  helperText,
  error,
  style,
  textStyle,
  ...props
}: NativeFormFieldProps) {
  const { theme } = useUnistyles();
  const nativeValue = useNativeState(value);

  useEffect(() => {
    if (nativeValue.value !== value) nativeValue.value = value;
    // The observable identity is stable; value is the synchronization trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Host>
      <Column spacing={theme.spacing.scale.sm}>
        <NativeText variant="labelMd" colorRole="strong">
          {label}
        </NativeText>
        <TextInput
          {...props}
          value={nativeValue}
          style={{
            paddingHorizontal: theme.spacing.scale.lg,
            paddingVertical: theme.spacing.scale.md,
            borderRadius: theme.radius.component.chip,
            borderWidth: theme.border.width.default,
            borderColor: error ? theme.colors.state.danger : theme.colors.border.default,
            backgroundColor: theme.colors.surface.default,
            ...style,
          }}
          textStyle={{
            ...theme.typography.bodyMd,
            color: theme.colors.content.default,
            ...textStyle,
          }}
        />
        {error ? <NativeText colorRole="danger">{error}</NativeText> : null}
        {!error && helperText ? <NativeText colorRole="muted">{helperText}</NativeText> : null}
      </Column>
    </Host>
  );
}
