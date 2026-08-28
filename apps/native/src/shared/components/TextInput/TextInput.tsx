import type { UniversalStyle, UniversalTextStyle } from "@expo/ui";

import { Host, TextInput as NativeTextInput, useNativeState } from "@expo/ui";
import { useEffect, useState } from "react";
import {
  StyleSheet as RNStyleSheet,
  type DimensionValue,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

/** Provides the native text input component and its Expo UI style adaptation. */
/** Describes the TextInputProps native type contract and behavior. */
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

type SplitTextInputStyle = {
  boxStyle: Partial<UniversalStyle>;
  textStyle: Partial<UniversalTextStyle>;
};

const FULL_WIDTH: DimensionValue = "100%";

function mapUniversalFontWeight(
  weight: TextStyle["fontWeight"],
): UniversalTextStyle["fontWeight"] | undefined {
  switch (weight) {
    case "normal":
    case "bold":
    case "100":
    case "200":
    case "300":
    case "400":
    case "500":
    case "600":
    case "700":
    case "800":
    case "900":
      return weight;
    case 100:
      return "100";
    case 200:
      return "200";
    case 300:
      return "300";
    case 400:
      return "400";
    case 500:
      return "500";
    case 600:
      return "600";
    case 700:
      return "700";
    case 800:
      return "800";
    case 900:
      return "900";
    default:
      return undefined;
  }
}

function mapUniversalTextAlign(
  textAlign: TextStyle["textAlign"],
): UniversalTextStyle["textAlign"] | undefined {
  switch (textAlign) {
    case "left":
    case "right":
    case "center":
      return textAlign;
    default:
      return undefined;
  }
}

/**
 * The Expo UI TextInput only accepts a constrained style subset (box paint via
 * `style`, text paint via `textStyle`) — neither covers layout props like
 * `margin*`/`minWidth`/`flex`. Anything outside both buckets is routed to the
 * `Host` wrapper instead, which is a full RN View and supports them natively.
 */
function splitStyle(style: StyleProp<ViewStyle & TextStyle>): SplitTextInputStyle {
  const flattened = RNStyleSheet.flatten(style);
  const boxStyle: Partial<UniversalStyle> = {};
  const textStyle: Partial<UniversalTextStyle> = {};

  if (!flattened) {
    return { boxStyle, textStyle };
  }

  boxStyle.padding = flattened.padding;
  boxStyle.paddingHorizontal = flattened.paddingHorizontal;
  boxStyle.paddingVertical = flattened.paddingVertical;
  boxStyle.paddingTop = flattened.paddingTop;
  boxStyle.paddingBottom = flattened.paddingBottom;
  boxStyle.paddingLeft = flattened.paddingLeft;
  boxStyle.paddingRight = flattened.paddingRight;
  boxStyle.backgroundColor = flattened.backgroundColor;
  boxStyle.borderRadius = flattened.borderRadius;
  boxStyle.borderWidth = flattened.borderWidth;
  boxStyle.borderColor = flattened.borderColor;
  boxStyle.opacity = flattened.opacity;
  boxStyle.width = flattened.width;
  boxStyle.height = flattened.height;

  textStyle.fontSize = flattened.fontSize;
  textStyle.fontWeight = mapUniversalFontWeight(flattened.fontWeight);
  textStyle.fontFamily = flattened.fontFamily;
  textStyle.lineHeight = flattened.lineHeight;
  textStyle.letterSpacing = flattened.letterSpacing;
  textStyle.textAlign = mapUniversalTextAlign(flattened.textAlign);
  if (flattened.color !== undefined && flattened.color !== null) {
    textStyle.color = String(flattened.color);
  }

  return { boxStyle, textStyle };
}

/** Describes the TextInput native function contract and behavior. */
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

  const { boxStyle, textStyle } = splitStyle(style);

  return (
    <Host matchContents={false} style={[base.stretch, style]}>
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
  stretch: { width: FULL_WIDTH },
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
