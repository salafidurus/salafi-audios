import type { SeriesContextDto } from "@sd/core-contracts";
import { View } from "react-native";
import { AppText } from "../../../../shared/components/AppText/AppText";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
};

export function SeriesContextBar({ seriesContext }: SeriesContextBarProps) {
  return (
    <View
      style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#f4f1e8",
        gap: 8,
      }}
    >
      <AppText variant="labelMd">Series</AppText>
      <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      {seriesContext.prevLecture ? (
        <AppText variant="bodySm" style={{ opacity: 0.7 }}>
          Previous: {seriesContext.prevLecture.title}
        </AppText>
      ) : null}
      {seriesContext.nextLecture ? (
        <AppText variant="bodySm" style={{ opacity: 0.7 }}>
          Next: {seriesContext.nextLecture.title}
        </AppText>
      ) : null}
    </View>
  );
}
