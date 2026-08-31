import type { ScholarDetailDto, AdminListingListItemDto } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { useMemo, useReducer } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { DraggableList, type RenderItemParams } from "@/shared/components/DraggableList";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { NativeBridgeHost } from "@/shared/ui";

import { updateSeries, updateCollection } from "../../api/admin-scholars.api";
import { CollectionSheet } from "../../components/CollectionSheet/CollectionSheet";
import { SeriesSheet } from "../../components/SeriesSheet/SeriesSheet";
import { useAdminSeries, useAdminCollections } from "../../hooks/use-admin-scholars";

/** Provides authenticated native administration workflows and their data boundaries. */
type AdminScholarDetailScreenProps = {
  /** Carries the canonical scholar identity used to scope content and admin requests. */
  scholarSlug: string;
};

type ScreenState = {
  seriesExpanded: boolean;
  collectionsExpanded: boolean;
  showSeriesSheet: boolean;
  showCollectionSheet: boolean;
  seriesOrder: AdminListingListItemDto[] | null;
  collectionOrder: AdminListingListItemDto[] | null;
};

function reduce(state: ScreenState, patch: Partial<ScreenState>): ScreenState {
  return { ...state, ...patch };
}

async function persistOrder(
  data: AdminListingListItemDto[],
  to: number,
  previous: AdminListingListItemDto[],
  setState: (patch: Partial<ScreenState>) => void,
  update: (id: string, patch: { orderIndex: number }) => Promise<void>,
  stateKey: "seriesOrder" | "collectionOrder",
) {
  setState({ [stateKey]: data });
  try {
    await update(data[to]!.id, { orderIndex: to });
  } catch {
    setState({ [stateKey]: previous });
  }
}

function getDisplayList(
  ordered: AdminListingListItemDto[] | null,
  fetched: AdminListingListItemDto[] | undefined,
) {
  return ordered ?? fetched ?? [];
}

function SeriesItem({
  item,
  drag,
  isActive,
}: {
  item: AdminListingListItemDto;
  drag: () => void;
  isActive: boolean;
}) {
  const itemStyle = useMemo(
    () => [styles.listItem, isActive ? styles.listItemActive : null],
    [isActive],
  );
  return (
    <Pressable onLongPress={drag} style={itemStyle}>
      <MarqueeText text={item.title} style={styles.listItemTitle} />
      <Text style={styles.listItemSubtitle}>
        {item.format} · {item.status}
      </Text>
    </Pressable>
  );
}

function CollectionItem({
  item,
  drag,
  isActive,
}: {
  item: AdminListingListItemDto;
  drag: () => void;
  isActive: boolean;
}) {
  const itemStyle = useMemo(
    () => [styles.listItem, isActive ? styles.listItemActive : null],
    [isActive],
  );
  return (
    <Pressable onLongPress={drag} style={itemStyle}>
      <MarqueeText text={item.title} style={styles.listItemTitle} />
      <Text style={styles.listItemSubtitle}>{item.status}</Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  isExpanded,
  onToggle,
  onAdd,
  canAdd,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  canAdd: boolean;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {canAdd ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      ) : null}
      <Text style={styles.chevron}>{isExpanded ? "▲" : "▼"}</Text>
    </Pressable>
  );
}

type ScholarDetailContentProps = {
  scholar: ScholarDetailDto;
  scholarId: string;
  /** Carries the canonical scholar identity used to scope content and admin requests. */
  scholarSlug: string;
  canAdd: boolean;
  seriesExpanded: boolean;
  collectionsExpanded: boolean;
  showSeriesSheet: boolean;
  showCollectionSheet: boolean;
  displaySeries: AdminListingListItemDto[];
  displayCollections: AdminListingListItemDto[];
  onToggleSeries: () => void;
  onToggleCollections: () => void;
  onAddSeries: () => void;
  onAddCollection: () => void;
  onSeriesDragEnd: (params: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => Promise<void>;
  onCollectionDragEnd: (params: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => Promise<void>;
  onCloseSeries: () => void;
  onCloseCollection: () => void;
  onSeriesSaved: () => void;
  onCollectionSaved: () => void;
};

function ScholarDetailContent({
  scholar,
  scholarId,
  scholarSlug,
  canAdd,
  seriesExpanded,
  collectionsExpanded,
  showSeriesSheet,
  showCollectionSheet,
  displaySeries,
  displayCollections,
  onToggleSeries,
  onToggleCollections,
  onAddSeries,
  onAddCollection,
  onSeriesDragEnd,
  onCollectionDragEnd,
  onCloseSeries,
  onCloseCollection,
  onSeriesSaved,
  onCollectionSaved,
}: ScholarDetailContentProps) {
  return (
    <NativeBridgeHost testID="admin-scholar-detail-host" matchContents={false}>
      <GestureHandlerRootView style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.scholarName}>{scholar.name}</Text>
          <Text style={styles.scholarSlug}>@{scholar.slug}</Text>

          <SectionHeader
            title="Series"
            isExpanded={seriesExpanded}
            onToggle={onToggleSeries}
            onAdd={onAddSeries}
            canAdd={canAdd}
          />
          {seriesExpanded &&
            (displaySeries.length === 0 ? (
              <EmptyState message="No series added yet." variant="empty" />
            ) : (
              <DraggableList
                data={displaySeries}
                keyExtractor={(item) => item.id}
                onDragEnd={onSeriesDragEnd}
                scrollEnabled={false}
                renderItem={({
                  item,
                  drag,
                  isActive,
                }: RenderItemParams<AdminListingListItemDto>) => (
                  <SeriesItem item={item} drag={drag} isActive={isActive} />
                )}
              />
            ))}

          <SectionHeader
            title="Collections"
            isExpanded={collectionsExpanded}
            onToggle={onToggleCollections}
            onAdd={onAddCollection}
            canAdd={canAdd}
          />
          {collectionsExpanded &&
            (displayCollections.length === 0 ? (
              <EmptyState message="No collections added yet." variant="empty" />
            ) : (
              <DraggableList
                data={displayCollections}
                keyExtractor={(item) => item.id}
                onDragEnd={onCollectionDragEnd}
                scrollEnabled={false}
                renderItem={({
                  item,
                  drag,
                  isActive,
                }: RenderItemParams<AdminListingListItemDto>) => (
                  <CollectionItem item={item} drag={drag} isActive={isActive} />
                )}
              />
            ))}

          <SeriesSheet
            isOpen={showSeriesSheet}
            scholarId={scholarId}
            scholarSlug={scholarSlug}
            onClose={onCloseSeries}
            onSaved={onSeriesSaved}
          />
          <CollectionSheet
            isOpen={showCollectionSheet}
            scholarId={scholarId}
            scholarSlug={scholarSlug}
            onClose={onCloseCollection}
            onSaved={onCollectionSaved}
          />
        </ScrollView>
      </GestureHandlerRootView>
    </NativeBridgeHost>
  );
}

/** Renders the native admin scholar detail screen surface and coordinates its user-facing state. */
export function AdminScholarDetailScreen({ scholarSlug }: AdminScholarDetailScreenProps) {
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { data: scholar } = useApiQuery<ScholarDetailDto>(["scholars", scholarSlug], () =>
    httpClient<ScholarDetailDto>({ url: endpoints.scholars.detail(scholarSlug), method: "GET" }),
  );

  const scholarId = scholar ? scholar.id : "";
  const canAdd = ability.can("create", subject("Listing", { scholarSlug }));

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

  const displaySeries = getDisplayList(seriesOrder, seriesList);
  const displayCollections = getDisplayList(collectionOrder, collectionList);

  const handleSeriesDragEnd = async ({
    data,
    to,
  }: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = getDisplayList(seriesOrder, seriesList);
    await persistOrder(
      data,
      to,
      prevOrder,
      dispatch,
      async (id, patch) => {
        await updateSeries(id, patch);
      },
      "seriesOrder",
    );
  };

  const handleCollectionDragEnd = async ({
    data,
    to,
  }: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = getDisplayList(collectionOrder, collectionList);
    await persistOrder(
      data,
      to,
      prevOrder,
      dispatch,
      async (id, patch) => {
        await updateCollection(id, patch);
      },
      "collectionOrder",
    );
  };

  if (!scholar) {
    return (
      <NativeBridgeHost testID="admin-scholar-detail-host" matchContents={false}>
        <View style={styles.loadingContainer}>
          <EmptyState message="Loading scholar…" variant="loading" />
        </View>
      </NativeBridgeHost>
    );
  }

  return (
    <ScholarDetailContent
      scholar={scholar}
      scholarId={scholarId}
      scholarSlug={scholarSlug}
      canAdd={canAdd}
      seriesExpanded={seriesExpanded}
      collectionsExpanded={collectionsExpanded}
      showSeriesSheet={showSeriesSheet}
      showCollectionSheet={showCollectionSheet}
      displaySeries={displaySeries}
      displayCollections={displayCollections}
      onToggleSeries={() => dispatch({ seriesExpanded: !seriesExpanded })}
      onToggleCollections={() => dispatch({ collectionsExpanded: !collectionsExpanded })}
      onAddSeries={() => dispatch({ showSeriesSheet: true })}
      onAddCollection={() => dispatch({ showCollectionSheet: true })}
      onSeriesDragEnd={handleSeriesDragEnd}
      onCollectionDragEnd={handleCollectionDragEnd}
      onCloseSeries={() => dispatch({ showSeriesSheet: false })}
      onCloseCollection={() => dispatch({ showCollectionSheet: false })}
      onSeriesSaved={() => {
        dispatch({ showSeriesSheet: false, seriesOrder: null });
        refetchSeries();
      }}
      onCollectionSaved={() => {
        dispatch({ showCollectionSheet: false, collectionOrder: null });
        refetchCollections();
      }}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  scrollContent: {
    padding: theme.spacing.scale.lg,
    paddingBottom: theme.spacing.scale["4xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scholarName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: theme.spacing.scale.xs,
    color: theme.colors.content.strong,
  },
  scholarSlug: {
    fontSize: 13,
    color: theme.colors.content.muted,
    marginBottom: theme.spacing.scale["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.scale.md,
    borderBottomWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.scale.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  addBtn: {
    paddingHorizontal: theme.spacing.scale.sm,
    paddingVertical: theme.spacing.scale.xs,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
    marginEnd: theme.spacing.scale.sm,
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
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.scale.sm,
    marginBottom: theme.spacing.scale.sm,
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
