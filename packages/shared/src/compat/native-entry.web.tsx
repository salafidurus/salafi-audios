import React from "react";
import { TextInputWeb } from "../components/TextInput/TextInput.web";

export interface ScreenViewMobileNativeProps {
  children: React.ReactNode;
  style?: unknown;
  contentStyle?: unknown;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

export function ScreenViewMobileNative({
  children,
  center = false,
}: ScreenViewMobileNativeProps) {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minHeight: "100%",
        justifyContent: center ? "center" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export interface ScreenInProgressMobileNativeProps {
  title?: string;
  description?: string;
}

export function ScreenInProgressMobileNative({
  title = "Coming Soon",
  description = "This feature is under development",
}: ScreenInProgressMobileNativeProps) {
  return (
    <div style={{ display: "grid", gap: "0.35rem", textAlign: "center" }}>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export interface AuthRequiredStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
}

export function AuthRequiredStateMobileNative({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateProps) {
  return (
    <div style={{ display: "grid", gap: "0.75rem", textAlign: "center" }}>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <button type="button" onClick={onPress}>
        {actionLabel}
      </button>
    </div>
  );
}

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
}

export function NotFoundStateMobileNative({
  title = "Page not found",
  description = "The desired screen doesn't exist or may have moved.",
  actionLabel = "Return to home screen",
  onPress,
}: NotFoundStateProps) {
  return (
    <AuthRequiredStateMobileNative
      title={title}
      description={description}
      actionLabel={actionLabel}
      onPress={onPress}
    />
  );
}

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonMobileNativeProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: unknown;
};

export function ButtonMobileNative({
  label,
  onPress,
  variant = "surface",
  disabled = false,
}: ButtonMobileNativeProps) {
  return (
    <button type="button" onClick={onPress} disabled={disabled} data-variant={variant}>
      {label}
    </button>
  );
}

export type TextInputMobileNativeProps = {
  invalid?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: string;
  secureTextEntry?: boolean;
  style?: unknown;
};

export function TextInputMobileNative({
  invalid = false,
  onChangeText,
  style,
  ...props
}: TextInputMobileNativeProps) {
  return (
    <TextInputWeb
      {...props}
      invalid={invalid}
      style={style as React.CSSProperties | undefined}
      onChange={(event) => onChangeText?.(event.target.value)}
    />
  );
}

export type UniversalListMobileNativeProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: object;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

export function UniversalListMobileNative<TItem>({
  items,
  keyExtractor,
  renderItem,
  itemSeparator: ItemSeparator,
  emptyComponent: EmptyComponent,
}: UniversalListMobileNativeProps<TItem>) {
  if (items.length === 0) {
    return EmptyComponent ? <EmptyComponent /> : null;
  }

  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item)}>
          {renderItem(item)}
          {ItemSeparator && index < items.length - 1 ? <ItemSeparator /> : null}
        </React.Fragment>
      ))}
    </>
  );
}

export function ProvidersMobileNative({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

type HapticStyle = "light" | "medium" | "heavy" | "soft" | "rigid";

export function useHaptic(_style: HapticStyle = "light") {
  return () => undefined;
}
