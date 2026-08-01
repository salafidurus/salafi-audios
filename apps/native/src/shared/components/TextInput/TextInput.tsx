import type { UniversalStyle, UniversalTextStyle } from "@expo/ui";

import { Host, TextInput as NativeTextInput, useNativeState } from "@expo/ui";
import { useEffect, useState } from "react";
import {
  StyleSheet as RNStyleSheet,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type TextInputProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  invalid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle & TextStyle>;
  testID?: string;
};

const BOX_STYLE_KEYS = new Set<keyof UniversalStyle>([
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "backgroundColor",
  "borderRadius",
  "borderWidth",
  "borderColor",
  "opacity",
  "width",
  "height",
]);

const TEXT_STYLE_KEYS = new Set<keyof UniversalTextStyle>([
  "fontSize",
  "fontWeight",
  "fontFamily",
  "color",
  "lineHeight",
  "letterSpacing",
  "textAlign",
]);

/**
 * @expo/ui's TextInput only accepts a constrained style subset (box paint via
 * `style`, text paint via `textStyle`) — neither covers layout props like
 * `margin*`/`minWidth`/`flex`. Anything outside both buckets is routed to the
 * `Host` wrapper instead, which is a full RN View and supports them natively.
 */
function splitStyle(style: StyleProp<ViewStyle & TextStyle>): {
  hostStyle: ViewStyle;
  boxStyle: UniversalStyle;
  textStyle: UniversalTextStyle;
} {
  const flattened = (RNStyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const hostStyle: Record<string, unknown> = {};
  const boxStyle: Record<string, unknown> = {};
  const textStyle: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(flattened)) {
    if (BOX_STYLE_KEYS.has(key as keyof UniversalStyle)) {
      boxStyle[key] = val;
    } else if (TEXT_STYLE_KEYS.has(key as keyof UniversalTextStyle)) {
      textStyle[key] = val;
    } else {
      hostStyle[key] = val;
    }
  }

  return { hostStyle, boxStyle, textStyle };
}

export function TextInput({
  value = "",
  onChangeText,
  placeholder,
  placeholderTextColor,
  editable = true,
  multiline,
  numberOfLines,
  secureTextEntry,
  keyboardType,
  maxLength,
  invalid = false,
  onFocus,
  onBlur,
  onSubmitEditing,
  style,
  testID,
}: TextInputProps) {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);
  const nativeValue = useNativeState(value);

  useEffect(() => {
    nativeValue.value = value;
    // nativeValue is a stable ObservableState identity per @expo/ui's contract;
    // only re-sync when the caller's own value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const { hostStyle, boxStyle, textStyle } = splitStyle(style);

  return (
    <Host matchContents={false} style={[base.stretch, hostStyle]}>
      <NativeTextInput
        value={nativeValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? theme.colors.content.muted}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        testID={testID}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onSubmitEditing={onSubmitEditing}
        style={{
          ...styles.input,
          ...(invalid ? styles.inputInvalid : isFocused ? styles.inputFocused : undefined),
          ...boxStyle,
        }}
        textStyle={{
          ...styles.text,
          ...textStyle,
        }}
      />
    </Host>
  );
}

const base = {
  stretch: { width: "100%" } as ViewStyle,
};

const styles = StyleSheet.create((theme) => ({
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip + 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
  },
  inputFocused: {
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.surface.default,
  },
  inputInvalid: {
    borderColor: theme.colors.state.danger,
  },
  text: {
    color: theme.colors.content.default,
    fontSize: theme.typography.bodyMd.fontSize,
  },
}));
