import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { NativeButton } from "@/shared/ui/native-button";
import { NativeText } from "@/shared/ui/native-text";

import { ScreenView } from "../ScreenView/ScreenView";

export type NotFoundStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
  testID?: string;
};

export function NotFoundState({
  title = "Page not found",
  description = "The desired screen doesn't exist or may have moved.",
  actionLabel = "Return to home screen",
  onPress,
  testID,
}: NotFoundStateProps) {
  const { theme } = useUnistyles();

  return (
    <ScreenView center testID={testID}>
      <Column alignment="center" spacing={theme.spacing.component.gapXl}>
        <Column alignment="center" spacing={theme.spacing.component.gapSm}>
          <NativeText variant="displayMd" colorRole="strong">
            {title}
          </NativeText>
          <NativeText variant="bodyMd" colorRole="muted">
            {description}
          </NativeText>
        </Column>
        <NativeButton label={actionLabel} variant="primary" size="md" onPress={onPress} />
      </Column>
    </ScreenView>
  );
}
