import { Column, Host, Text as ExpoText } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { toUniversalTextStyle } from "../../../core/styles/expo-ui";
import { Button } from "../Button/Button";
import { ScreenView } from "../ScreenView/ScreenView";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by Auth Required State. */
export type AuthRequiredStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

/** Enumerates the lifecycle values used by the native auth required workflow. */
export function AuthRequiredState({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateProps) {
  const { theme } = useUnistyles();

  return (
    <ScreenView center contentStyle={styles.content}>
      <Host matchContents={{ vertical: true }} style={styles.textContent}>
        <Column spacing={theme.spacing.component.gapSm}>
          <ExpoText
            textStyle={{
              ...toUniversalTextStyle(theme, "titleLg", theme.colors.content.strong),
              textAlign: "center",
            }}
          >
            {title}
          </ExpoText>
          <ExpoText
            textStyle={{
              ...toUniversalTextStyle(theme, "bodyMd", theme.colors.content.muted),
              textAlign: "center",
            }}
          >
            {description}
          </ExpoText>
        </Column>
      </Host>
      <Host matchContents>
        <Column>
          <Button variant="primary" size="md" label={actionLabel} onPress={onPress} />
        </Column>
      </Host>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.component.gapXl,
  },
  textContent: {
    width: "100%",
  },
}));
