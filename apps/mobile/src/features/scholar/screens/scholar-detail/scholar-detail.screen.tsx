import { View, ScrollView } from "react-native";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarHeader } from "../../components/scholar-header/scholar-header";
import { ScholarContentList } from "../../components/scholar-content-list/scholar-content-list";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholar...</AppText>
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">Scholar not found</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
        <ScholarHeader scholar={scholar} />
        <View style={{ marginTop: 24 }}>
          {content && <ScholarContentList content={content} />}
        </View>
      </ScrollView>
    </ScreenView>
  );
}
