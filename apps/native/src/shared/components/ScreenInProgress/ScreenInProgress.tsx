import { Column, Host, Text as ExpoText } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { toUniversalTextStyle } from "../../../core/styles/expo-ui";
import { ScreenView } from "../ScreenView/ScreenView";

/** Provides a reusable native UI primitive with a focused rendering contract. */
type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

/** Defines the native screen in progress contract used by this module. */
export function ScreenInProgress({
  title = "Coming Soon",
  description = "This feature is under development",
}: ScreenInProgressProps) {
  const { theme } = useUnistyles();

  return (
    <ScreenView center>
      <Host matchContents>
        <Column spacing={theme.spacing.component.gapSm}>
          <ExpoText
            textStyle={{
              ...toUniversalTextStyle(theme, "titleLg", theme.colors.content.primary),
              textAlign: "center",
            }}
          >
            {title}
          </ExpoText>
          <ExpoText
            textStyle={{
              ...toUniversalTextStyle(theme, "bodySm", theme.colors.content.default),
              textAlign: "center",
            }}
          >
            {description}
          </ExpoText>
        </Column>
      </Host>
    </ScreenView>
  );
}
