import { Host, Switch } from "@expo/ui";
import { Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const showOriginal = useShowOriginalContent();

  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {t("account.showOriginalContent", "Show content in its original language")}
      </Text>
      <Host matchContents seedColor={theme.colors.action.primary}>
        <Switch
          value={showOriginal}
          onValueChange={setShowOriginalContent}
          testID="content-language-toggle-switch"
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.component.gapMd,
  },
  label: {
    flex: 1,
    ...theme.typography.bodySm,
    color: theme.colors.content.strong,
  },
}));
