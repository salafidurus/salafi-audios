import { View, ScrollView, Text, Pressable } from "react-native";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";

export function AdminTopicsMobileNativeScreen() {
  const { data, isFetching } = useApiQuery<TopicDetailDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading topics...</Text>
      </View>
    );
  }

  const topics = data ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Manage Topics</Text>
      {topics.map((t) => (
        <Pressable
          key={t.id}
          style={{
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e0e0e0",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{t.name}</Text>
          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{t.slug}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
