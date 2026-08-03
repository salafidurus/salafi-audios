import type { AdminListingListItemDto, ScholarDetailDto } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { Column, RNHostView, Row } from "@expo/ui";
import { endpoints, httpClient, useApiQuery } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { Stack } from "expo-router";
import { useReducer } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { DraggableList, DraggableListRow } from "@/shared/components/DraggableList";
import { NativeButton, NativeScreenHost, NativeStateView, NativeText } from "@/shared/ui";

import { updateCollection, updateSeries } from "../../api/admin-scholars.api";
import { CollectionSheet } from "../../components/CollectionSheet/CollectionSheet";
import { SeriesSheet } from "../../components/SeriesSheet/SeriesSheet";
import { useAdminCollections, useAdminSeries } from "../../hooks/use-admin-scholars";

type AdminScholarDetailScreenProps = {
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
  const { theme } = useUnistyles();

  return (
    <Row alignment="center" spacing={theme.spacing.component.gapSm}>
      <NativeText variant="titleMd" colorRole="strong">
        {title}
      </NativeText>
      <NativeButton
        label={isExpanded ? "Hide" : "Show"}
        onPress={onToggle}
        size="sm"
        testID={`admin-scholar-${title.toLowerCase()}-toggle`}
        variant="ghost"
      />
      {canAdd ? (
        <NativeButton
          label="Add"
          icon="add"
          onPress={onAdd}
          size="sm"
          testID={`admin-scholar-${title.toLowerCase()}-add`}
        />
      ) : null}
    </Row>
  );
}

export function AdminScholarDetailScreen({ scholarSlug }: AdminScholarDetailScreenProps) {
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { data: scholar } = useApiQuery<ScholarDetailDto>(["scholars", scholarSlug], () =>
    httpClient<ScholarDetailDto>({ url: endpoints.scholars.detail(scholarSlug), method: "GET" }),
  );

  const scholarId = scholar?.id ?? "";
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

  const displaySeries = state.seriesOrder ?? seriesList ?? [];
  const displayCollections = state.collectionOrder ?? collectionList ?? [];

  const handleSeriesDragEnd = async ({
    data,
    to,
  }: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => {
    const previousOrder = state.seriesOrder ?? seriesList ?? [];
    dispatch({ seriesOrder: data });
    try {
      await updateSeries(data[to]!.id, { orderIndex: to });
    } catch {
      dispatch({ seriesOrder: previousOrder });
    }
  };

  const handleCollectionDragEnd = async ({
    data,
    to,
  }: {
    data: AdminListingListItemDto[];
    from: number;
    to: number;
  }) => {
    const previousOrder = state.collectionOrder ?? collectionList ?? [];
    dispatch({ collectionOrder: data });
    try {
      await updateCollection(data[to]!.id, { orderIndex: to });
    } catch {
      dispatch({ collectionOrder: previousOrder });
    }
  };

  if (!scholar) {
    return (
      <NativeScreenHost testID="admin-scholar-detail-host">
        <Column style={{ padding: theme.spacing.layout.pageX }}>
          <NativeStateView kind="loading" title="Loading scholar…" />
        </Column>
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="admin-scholar-detail-host">
      <Stack.Screen options={{ title: scholar.name }} />
      <Column
        spacing={theme.spacing.component.gapLg}
        style={{ padding: theme.spacing.layout.pageX }}
      >
        <NativeText colorRole="muted" variant="bodySm">
          {`@${scholar.slug}`}
        </NativeText>

        <SectionHeader
          title="Series"
          isExpanded={state.seriesExpanded}
          onToggle={() => dispatch({ seriesExpanded: !state.seriesExpanded })}
          onAdd={() => dispatch({ showSeriesSheet: true })}
          canAdd={canAdd}
        />
        {state.seriesExpanded &&
          (displaySeries.length === 0 ? (
            <NativeStateView kind="empty" title="No series added yet." />
          ) : (
            <RNHostView matchContents>
              <DraggableList
                data={displaySeries}
                keyExtractor={(item) => item.id}
                onDragEnd={handleSeriesDragEnd}
                scrollEnabled={false}
                renderItem={({ item, drag, isActive }) => (
                  <DraggableListRow
                    drag={drag}
                    isActive={isActive}
                    supportingText={[item.format, item.status].filter(Boolean).join(" · ")}
                    testID={`admin-scholar-series-row-${item.id}`}
                    title={item.title}
                  />
                )}
              />
            </RNHostView>
          ))}

        <SectionHeader
          title="Collections"
          isExpanded={state.collectionsExpanded}
          onToggle={() => dispatch({ collectionsExpanded: !state.collectionsExpanded })}
          onAdd={() => dispatch({ showCollectionSheet: true })}
          canAdd={canAdd}
        />
        {state.collectionsExpanded &&
          (displayCollections.length === 0 ? (
            <NativeStateView kind="empty" title="No collections added yet." />
          ) : (
            <RNHostView matchContents>
              <DraggableList
                data={displayCollections}
                keyExtractor={(item) => item.id}
                onDragEnd={handleCollectionDragEnd}
                scrollEnabled={false}
                renderItem={({ item, drag, isActive }) => (
                  <DraggableListRow
                    drag={drag}
                    isActive={isActive}
                    supportingText={item.status}
                    testID={`admin-scholar-collection-row-${item.id}`}
                    title={item.title}
                  />
                )}
              />
            </RNHostView>
          ))}
      </Column>

      <SeriesSheet
        isOpen={state.showSeriesSheet}
        scholarId={scholarId}
        scholarSlug={scholarSlug}
        onClose={() => dispatch({ showSeriesSheet: false })}
        onSaved={() => {
          dispatch({ showSeriesSheet: false, seriesOrder: null });
          refetchSeries();
        }}
      />
      <CollectionSheet
        isOpen={state.showCollectionSheet}
        scholarId={scholarId}
        scholarSlug={scholarSlug}
        onClose={() => dispatch({ showCollectionSheet: false })}
        onSaved={() => {
          dispatch({ showCollectionSheet: false, collectionOrder: null });
          refetchCollections();
        }}
      />
    </NativeScreenHost>
  );
}
