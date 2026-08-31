import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  setShowOriginalContent,
  useShowOriginalContent,
} from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { NativeSwitch } from "@/shared/ui/native-switch";

/** Settings toggle that switches catalogue content (lectures, series,
 * collections) between the selected language and its original language. */
/** Renders the native content language toggle surface and coordinates its user-facing state. */
export function ContentLanguageToggle() {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  return (
    <View style={styles.row}>
      <AppText variant="bodySm" style={styles.label}>
        {t("account.showOriginalContent", "Show content in its original language")}
      </AppText>
      <NativeSwitch
        value={showOriginal}
        onValueChange={setShowOriginalContent}
        testID="content-language-toggle-switch"
      />
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
