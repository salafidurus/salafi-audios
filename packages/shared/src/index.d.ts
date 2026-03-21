export * from "./index.web";

import type * as React from "react";
import type { PressableProps, TextInputProps, ViewStyle } from "react-native";

export interface ScreenViewMobileNativeProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

export declare function ScreenViewMobileNative(
  props: ScreenViewMobileNativeProps,
): React.ReactElement;

export declare function ScreenInProgressMobileNative(): React.ReactElement;

export interface AuthRequiredStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
}

export declare function AuthRequiredStateMobileNative(
  props: AuthRequiredStateProps,
): React.ReactElement;

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
}

export declare function NotFoundStateMobileNative(
  props: NotFoundStateProps,
): React.ReactElement;

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonMobileNativeProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
};

export declare function ButtonMobileNative(
  props: ButtonMobileNativeProps,
): React.ReactElement;

export type TextInputMobileNativeProps = TextInputProps & {
  invalid?: boolean;
};

export declare function TextInputMobileNative(
  props: TextInputMobileNativeProps,
): React.ReactElement;

export type UniversalListMobileNativeProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: object;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

export declare function UniversalListMobileNative<TItem>(
  props: UniversalListMobileNativeProps<TItem>,
): React.ReactElement;

export declare function ProvidersMobileNative(props: {
  children: React.ReactNode;
}): React.ReactElement;

type HapticStyle = "light" | "medium" | "heavy" | "soft" | "rigid";

export declare function useHaptic(style?: HapticStyle): () => void;
