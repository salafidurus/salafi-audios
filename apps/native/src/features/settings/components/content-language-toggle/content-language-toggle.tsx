import { Host, Switch } from "@expo/ui";
import { Text, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
/** Toggles whether native content prefers the original source language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const showOriginal = useShowOriginalContent();
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.component.gapMd }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, lineHeight: 20, color: theme.colors.content.strong }}>
          {t("account.showOriginalContent", "Show content in its original language")}
        </Text>
      </View>
      <Host matchContents>
        <Switch
          value={showOriginal}
          onValueChange={setShowOriginalContent}
          testID="content-language-toggle-switch"
        />
      </Host>
    </View>
  );
}
