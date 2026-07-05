import { Switch, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "@/core/i18n/use-translation";
import { setShowOriginalContent, useShowOriginalContent } from "@/features/i18n/content-preference";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {t("account.showOriginalContent", "Show content in its original language")}
      </Text>
      <Switch value={showOriginal} onValueChange={setShowOriginalContent} />
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
