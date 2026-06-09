import { FlatList, Pressable, Text, View } from "react-native";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";

type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

export function AdminScholarsScreen({ onNavigateToScholar }: AdminScholarsScreenProps) {
  const { data, isLoading } = useApiQuery<ScholarListItemDto[]>(["scholars", "list"], () =>
    httpClient<ScholarListItemDto[]>({ url: endpoints.scholars.list, method: "GET" }),
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Scholars</Text>
      </View>
      {isLoading ? (
        <Text style={{ textAlign: "center", marginTop: 32 }}>Loading…</Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item: ScholarListItemDto) => item.id}
          renderItem={({ item }: { item: ScholarListItemDto }) => (
            <Pressable
              onPress={() => onNavigateToScholar(item.slug)}
              style={{
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#e5e5e5",
                borderRadius: 8,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: "#6b7280" }}>@{item.slug}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
