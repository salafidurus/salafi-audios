import type { UniversalStyle } from "@expo/ui";

import { Host, Button as NativeButton } from "@expo/ui";
import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { getButtonTokens, type ButtonSize, type ButtonVariant } from "./button.tokens";

// Web/Jest fallback — apps/native targets iOS and Android as separate
// platform-specific files (Button.ios.tsx, Button.android.tsx) with full
// control over their native modifier chains. This universal-component
// version is what Metro resolves for platforms without a dedicated file.
export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  variant = "surface",
  size = "md",
  label,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  onPress,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useUnistyles();
  const isDisabled = disabled || loading;
  const t = getButtonTokens(variant, size, theme);

  const nativeStyle: UniversalStyle = {
    backgroundColor: t.backgroundColor,
    ...(t.borderColor ? { borderColor: t.borderColor, borderWidth: t.borderWidth } : {}),
    borderRadius: t.borderRadius,
    paddingHorizontal: t.paddingHorizontal,
    height: t.height,
  };

  return (
    <Host matchContents={!fullWidth} style={[fullWidth && base.stretch, style]}>
      <NativeButton
        variant="text"
        onPress={onPress}
        disabled={isDisabled}
        testID={testID}
        style={nativeStyle}
      >
        <View style={[base.content, { gap: t.gap }]}>
          {loading ? (
            <ActivityIndicator size="small" color={t.indicatorColor} />
          ) : (
            <>
              {icon && iconPosition === "left" ? icon : null}
              <Text style={t.labelStyle}>{label}</Text>
              {icon && iconPosition === "right" ? icon : null}
            </>
          )}
        </View>
      </NativeButton>
    </Host>
  );
}

const base = {
  stretch: { width: "100%" } as ViewStyle,
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
};
