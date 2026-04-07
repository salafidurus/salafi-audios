import { View, ScrollView, Text } from "react-native";
import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";
import { ScholarHeaderNative } from "../../components/scholar-header/scholar-header.native";
import { ScholarContentListNative } from "../../components/scholar-content-list/scholar-content-list.native";

export type ScholarDetailMobileNativeScreenProps = {
  slug: string;
};

export function ScholarDetailMobileNativeScreen({ slug }: ScholarDetailMobileNativeScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading scholar...</Text>
      </View>
    );
  }

  if (!scholar) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Scholar not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <ScholarHeaderNative scholar={scholar} />
      <View style={{ marginTop: 24 }}>
        {content && <ScholarContentListNative content={content} />}
      </View>
    </ScrollView>
  );
}
