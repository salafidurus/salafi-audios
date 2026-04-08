import { useState } from "react";
import { TextInput as RNTextInput, type TextInputProps, type TextStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type TextInputMobileNativeProps = TextInputProps & {
  invalid?: boolean;
};

export function TextInputMobileNative({
  invalid = false,
  onFocus,
  onBlur,
  style,
  placeholderTextColor,
  ...props
}: TextInputMobileNativeProps) {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <RNTextInput
      {...props}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      placeholderTextColor={placeholderTextColor ?? theme.colors.content.muted}
      style={[
        styles.input,
        invalid ? styles.inputInvalid : isFocused ? styles.inputFocused : undefined,
        style as TextStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip + 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
    color: theme.colors.content.default,
    ...theme.typography.bodyMd,
  },
  inputFocused: {
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.surface.default,
    ...theme.shadows.sm,
  },
  inputInvalid: {
    borderColor: theme.colors.state.danger,
    shadowColor: theme.colors.state.danger,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
}));
