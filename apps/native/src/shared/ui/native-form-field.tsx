import { Column, TextInput, useNativeState, type TextInputProps } from "@expo/ui";
import { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

import { NativeText } from "./native-text";

export type NativeFormFieldProps = Omit<TextInputProps, "defaultValue" | "value"> & {
  label: string;
  value: string;
  helperText?: string;
  error?: string;
};

export function NativeFormField({
  label,
  value,
  helperText,
  error,
  placeholderTextColor,
  style,
  textStyle,
  ...props
}: NativeFormFieldProps) {
  const { theme } = useUnistyles();
  const nativeValue = useNativeState(value);

  useEffect(() => {
    if (nativeValue.value !== value) {
      nativeValue.value = value;
    }
    // Expo UI keeps a stable ObservableState identity; the caller's value is
    // the only synchronization trigger for this controlled adapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Column spacing={theme.spacing.scale.sm}>
      <NativeText variant="labelMd" colorRole="strong">
        {label}
      </NativeText>
      <TextInput
        {...props}
        value={nativeValue}
        placeholderTextColor={placeholderTextColor ?? theme.colors.content.muted}
        cursorColor={theme.colors.action.primary}
        style={{
          width: "100%",
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
      {error ? (
        <NativeText variant="bodySm" colorRole="danger">
          {error}
        </NativeText>
      ) : helperText ? (
        <NativeText variant="bodySm" colorRole="muted">
          {helperText}
        </NativeText>
      ) : null}
    </Column>
  );
}
