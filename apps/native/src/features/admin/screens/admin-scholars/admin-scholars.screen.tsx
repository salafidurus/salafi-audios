import type { ScholarListItemDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";

type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

export function AdminScholarsScreen({ onNavigateToScholar }: AdminScholarsScreenProps) {
  const { data, isLoading } = useApiQuery<ScholarListItemDto[]>(["scholars", "list"], () =>
    httpClient<ScholarListItemDto[]>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const scholars = data ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="titleLg">Scholars</AppText>
        </View>
        {isLoading ? (
          <AppText variant="bodyMd" style={styles.loadingText}>
            Loading…
          </AppText>
        ) : (
          <List>
            {scholars.map((item, index) => (
              <List.Item
                key={item.id}
                onPress={() => onNavigateToScholar(item.slug)}
                hideBorder={index === scholars.length - 1}
              >
                <View style={styles.rowContent}>
                  <AppText variant="bodyMd" style={styles.rowName}>
                    {item.name}
                  </AppText>
                  <AppText variant="caption" style={styles.rowSlug}>
                    @{item.slug}
                  </AppText>
                </View>
              </List.Item>
            ))}
          </List>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  scrollContent: {
    padding: theme.spacing.scale.md,
  },
  header: {
    paddingVertical: theme.spacing.scale.md,
  },
  loadingText: {
    textAlign: "center",
    marginTop: theme.spacing.scale["3xl"],
    color: theme.colors.content.muted,
  },
  rowContent: {
    gap: theme.spacing.scale.xs,
  },
  rowName: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowSlug: {
    color: theme.colors.content.muted,
  },
}));
