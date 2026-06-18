import type { ScholarContentDto } from "@sd/core-contracts";
import { View } from "react-native";
import { pickContentField } from "@sd/core-i18n";
import { AppText } from "@/shared/components/AppText/AppText";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type ScholarContentListProps = {
  content: ScholarContentDto;
};

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <AppText variant="titleMd" style={{ marginBottom: 8 }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export function ScholarContentList({ content }: ScholarContentListProps) {
  const showOriginal = useShowOriginalContent();
  const hasContent =
    content.collections.length > 0 ||
    content.standaloneSeries.length > 0 ||
    content.standaloneLectures.length > 0;

  if (!hasContent) {
    return (
      <AppText variant="bodyMd" style={{ opacity: 0.7 }}>
        No published content yet.
      </AppText>
    );
  }

  return (
    <View>
      {content.collections.length > 0 ? (
        <ContentSection title="Collections">
          {content.collections.map((collection) => {
            const title = pickContentField(
              collection.title,
              collection.original?.title,
              showOriginal,
            );
            return (
              <View
                key={collection.id}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
              >
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {collection.lectureCount} series
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}

      {content.standaloneSeries.length > 0 ? (
        <ContentSection title="Series">
          {content.standaloneSeries.map((series) => {
            const title = pickContentField(series.title, series.original?.title, showOriginal);
            return (
              <View
                key={series.id}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
              >
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {series.lectureCount} lectures
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}

      {content.standaloneLectures.length > 0 ? (
        <ContentSection title="Lectures">
          {content.standaloneLectures.map((lecture) => {
            const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
            return (
              <View
                key={lecture.id}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" }}
              >
                <AppText variant="labelMd">{title}</AppText>
                <AppText variant="caption" style={{ marginTop: 2, opacity: 0.6 }}>
                  {lecture.durationSeconds ? `${Math.round(lecture.durationSeconds / 60)} min` : ""}
                </AppText>
              </View>
            );
          })}
        </ContentSection>
      ) : null}
    </View>
  );
}
