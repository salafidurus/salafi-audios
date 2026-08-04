import { Column, Row, Switch } from "@expo/ui";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import { NativeText } from "@/shared/ui";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const showOriginal = useShowOriginalContent();
  const fullWidthModifiers = process.env.EXPO_OS === "android" ? [fillMaxWidth()] : [];
  const flexibleTextModifiers = process.env.EXPO_OS === "android" ? [weight(1)] : [];

  return (
    <Row alignment="center" modifiers={fullWidthModifiers} spacing={theme.spacing.component.gapMd}>
      <Column modifiers={flexibleTextModifiers}>
        <NativeText variant="bodySm" colorRole="strong">
          {t("account.showOriginalContent", "Show content in its original language")}
        </NativeText>
      </Column>
      <Switch
        value={showOriginal}
        onValueChange={setShowOriginalContent}
        testID="content-language-toggle-switch"
      />
    </Row>
  );
}
