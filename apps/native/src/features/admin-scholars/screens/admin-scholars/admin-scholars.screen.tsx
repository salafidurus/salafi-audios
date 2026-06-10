import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";

type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

type ScholarRowProps = {
  item: ScholarListItemDto;
  onPress: (slug: string) => void;
};

function ScholarRow({ item, onPress }: ScholarRowProps) {
  const handlePress = useCallback(() => onPress(item.slug), [onPress, item.slug]);
  return (
    <Pressable onPress={handlePress} style={styles.row}>
      <Text style={styles.rowName}>{item.name}</Text>
      <Text style={styles.rowSlug}>@{item.slug}</Text>
    </Pressable>
  );
}

export function AdminScholarsScreen({ onNavigateToScholar }: AdminScholarsScreenProps) {
  const { data, isLoading } = useApiQuery<ScholarListItemDto[]>(["scholars", "list"], () =>
    httpClient<ScholarListItemDto[]>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const renderItem = useCallback(
    ({ item }: { item: ScholarListItemDto }) => (
      <ScholarRow item={item} onPress={onNavigateToScholar} />
    ),
    [onNavigateToScholar],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Scholars</Text>
      </View>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading…</Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item: ScholarListItemDto) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 32,
  },
  row: {
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  rowName: {
    fontWeight: "600",
  },
  rowSlug: {
    fontSize: 12,
    color: "#6b7280",
  },
});
