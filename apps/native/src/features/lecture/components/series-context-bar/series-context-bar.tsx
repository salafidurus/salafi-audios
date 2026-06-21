import type { SeriesContextDto } from "@sd/core-contracts";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppText } from "@/shared/components/AppText/AppText";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
};

export function SeriesContextBar({ seriesContext }: SeriesContextBarProps) {
  return (
    <View style={styles.container}>
      <AppText variant="labelMd">Series</AppText>
      <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      {seriesContext.prevLecture ? (
        <AppText variant="bodySm" style={styles.navText}>
          Previous: {seriesContext.prevLecture.title}
        </AppText>
      ) : null}
      {seriesContext.nextLecture ? (
        <AppText variant="bodySm" style={styles.navText}>
          Next: {seriesContext.nextLecture.title}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface.subtle,
    gap: 8,
  },
  navText: {
    opacity: 0.7,
  },
}));
