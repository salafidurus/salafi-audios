import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenHeader } from "@/shared/components/ScreenHeader/ScreenHeader";
import { ScreenInProgress } from "@/shared/components/ScreenInProgress/ScreenInProgress";

export function CurationScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <ScreenHeader title={t("navigation.subnav.explore.curation", "Curation")} />
      <ScreenInProgress description={t("explore.curation.description", "Coming soon")} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
}));
