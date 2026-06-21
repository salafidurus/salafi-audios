import { useMemo, useReducer } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraggableList, type RenderItemParams } from "@/shared/components/DraggableList";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarDetailDto,
  AdminSeriesListItemDto,
  AdminCollectionListItemDto,
} from "@sd/core-contracts";
import { useAdminSeries, useAdminCollections } from "../../hooks/use-admin-scholars";
import { updateSeries, updateCollection } from "../../api/admin-scholars.api";
import { SeriesSheet } from "../../components/SeriesSheet/SeriesSheet";
import { CollectionSheet } from "../../components/CollectionSheet/CollectionSheet";

type AdminScholarDetailScreenProps = {
  scholarSlug: string;
};

type ScreenState = {
  seriesExpanded: boolean;
  collectionsExpanded: boolean;
  showSeriesSheet: boolean;
  showCollectionSheet: boolean;
  seriesOrder: AdminSeriesListItemDto[] | null;
  collectionOrder: AdminCollectionListItemDto[] | null;
};

function reduce(state: ScreenState, patch: Partial<ScreenState>): ScreenState {
  return { ...state, ...patch };
}

function SeriesItem({
  item,
  drag,
  isActive,
}: {
  item: AdminSeriesListItemDto;
  drag: () => void;
  isActive: boolean;
}) {
  const itemStyle = useMemo(
    () => [styles.listItem, isActive ? styles.listItemActive : null],
    [isActive],
  );
  return (
    <Pressable onLongPress={drag} style={itemStyle}>
      <Text style={styles.listItemTitle}>{item.title}</Text>
      <Text style={styles.listItemSubtitle}>
        {item.publishedLectureCount ?? 0} lectures · {item.status}
      </Text>
    </Pressable>
  );
}

function CollectionItem({
  item,
  drag,
  isActive,
}: {
  item: AdminCollectionListItemDto;
  drag: () => void;
  isActive: boolean;
}) {
  const itemStyle = useMemo(
    () => [styles.listItem, isActive ? styles.listItemActive : null],
    [isActive],
  );
  return (
    <Pressable onLongPress={drag} style={itemStyle}>
      <Text style={styles.listItemTitle}>{item.title}</Text>
      <Text style={styles.listItemSubtitle}>{item.status}</Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  isExpanded,
  onToggle,
  onAdd,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        style={styles.addBtn}
      >
        <Text style={styles.addBtnText}>+ Add</Text>
      </Pressable>
      <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
    </Pressable>
  );
}

export function AdminScholarDetailScreen({ scholarSlug }: AdminScholarDetailScreenProps) {
  const { data: scholar } = useApiQuery<ScholarDetailDto>(["scholars", scholarSlug], () =>
    httpClient<ScholarDetailDto>({ url: endpoints.scholars.detail(scholarSlug), method: "GET" }),
  );

  const scholarId = scholar?.id ?? "";

  const { data: seriesList, refetch: refetchSeries } = useAdminSeries(scholarId);
  const { data: collectionList, refetch: refetchCollections } = useAdminCollections(scholarId);

  const [state, dispatch] = useReducer(reduce, {
    seriesExpanded: true,
    collectionsExpanded: true,
    showSeriesSheet: false,
    showCollectionSheet: false,
    seriesOrder: null,
    collectionOrder: null,
  });

  const {
    seriesExpanded,
    collectionsExpanded,
    showSeriesSheet,
    showCollectionSheet,
    seriesOrder,
    collectionOrder,
  } = state;

  const displaySeries = seriesOrder ?? seriesList ?? [];
  const displayCollections = collectionOrder ?? collectionList ?? [];

  const handleSeriesDragEnd = async ({
    data,
    to,
  }: {
    data: AdminSeriesListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = seriesOrder ?? seriesList ?? [];
    dispatch({ seriesOrder: data });
    try {
      await updateSeries(data[to]!.id, { orderIndex: to });
    } catch {
      dispatch({ seriesOrder: prevOrder });
    }
  };

  const handleCollectionDragEnd = async ({
    data,
    to,
  }: {
    data: AdminCollectionListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = collectionOrder ?? collectionList ?? [];
    dispatch({ collectionOrder: data });
    try {
      await updateCollection(data[to]!.id, { orderIndex: to });
    } catch {
      dispatch({ collectionOrder: prevOrder });
    }
  };

  if (!scholar) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.scholarName}>{scholar.name}</Text>
        <Text style={styles.scholarSlug}>@{scholar.slug}</Text>

        {/* Series section */}
        <SectionHeader
          title="Series"
          isExpanded={seriesExpanded}
          onToggle={() => dispatch({ seriesExpanded: !seriesExpanded })}
          onAdd={() => dispatch({ showSeriesSheet: true })}
        />
        {seriesExpanded && (
          <DraggableList
            data={displaySeries}
            keyExtractor={(item) => item.id}
            onDragEnd={handleSeriesDragEnd}
            scrollEnabled={false}
            renderItem={({ item, drag, isActive }: RenderItemParams<AdminSeriesListItemDto>) => (
              <SeriesItem item={item} drag={drag} isActive={isActive} />
            )}
          />
        )}

        {/* Collections section */}
        <SectionHeader
          title="Collections"
          isExpanded={collectionsExpanded}
          onToggle={() => dispatch({ collectionsExpanded: !collectionsExpanded })}
          onAdd={() => dispatch({ showCollectionSheet: true })}
        />
        {collectionsExpanded && (
          <DraggableList
            data={displayCollections}
            keyExtractor={(item) => item.id}
            onDragEnd={handleCollectionDragEnd}
            scrollEnabled={false}
            renderItem={({
              item,
              drag,
              isActive,
            }: RenderItemParams<AdminCollectionListItemDto>) => (
              <CollectionItem item={item} drag={drag} isActive={isActive} />
            )}
          />
        )}

        <SeriesSheet
          isOpen={showSeriesSheet}
          scholarId={scholarId}
          onClose={() => dispatch({ showSeriesSheet: false })}
          onSaved={() => {
            dispatch({ showSeriesSheet: false, seriesOrder: null });
            refetchSeries();
          }}
        />
        <CollectionSheet
          isOpen={showCollectionSheet}
          scholarId={scholarId}
          onClose={() => dispatch({ showCollectionSheet: false })}
          onSaved={() => {
            dispatch({ showCollectionSheet: false, collectionOrder: null });
            refetchCollections();
          }}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scholarName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: theme.colors.content.strong,
  },
  scholarSlug: {
    fontSize: 13,
    color: theme.colors.content.muted,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.action.primary,
    borderRadius: 6,
    marginEnd: 8,
  },
  addBtnText: {
    color: theme.colors.content.onPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  chevron: {
    color: theme.colors.content.muted,
  },
  listItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface.default,
    opacity: 1,
  },
  listItemActive: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.surface.primarySubtle,
    opacity: 0.9,
  },
  listItemTitle: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
