import { useCallback } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.scale.lg,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  loadingText: {
    textAlign: "center",
    marginTop: theme.spacing.scale["3xl"],
    color: theme.colors.content.muted,
  },
  row: {
    padding: theme.spacing.scale.md,
    marginHorizontal: theme.spacing.scale.lg,
    marginBottom: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.default,
  },
  rowName: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowSlug: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
