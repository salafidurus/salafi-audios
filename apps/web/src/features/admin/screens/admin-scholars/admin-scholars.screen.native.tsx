import { View, ScrollView, Text, Pressable } from "react-native";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";

type ScholarsListDto = { scholars: ScholarListItemDto[] };

export function AdminScholarsMobileNativeScreen() {
  const { data, isFetching } = useApiQuery<ScholarsListDto>(queryKeys.scholars.list(), () =>
    httpClient<ScholarsListDto>({ url: endpoints.scholars.list, method: "GET" }),
  );

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading scholars...</Text>
      </View>
    );
  }

  const scholars = data?.scholars ?? [];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Manage Scholars</Text>
      {scholars.map((s) => (
        <Pressable
          key={s.id}
          style={{
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e0e0e0",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{s.name}</Text>
          <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {s.slug} · {s.lectureCount} lectures {s.isKibar ? " · Kibar" : ""}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
