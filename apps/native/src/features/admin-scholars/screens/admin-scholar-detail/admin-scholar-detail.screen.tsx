import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
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
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 8,
      }}
    >
      <Text style={{ flex: 1, fontSize: 16, fontWeight: "700" }}>{title}</Text>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          marginRight: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>+ Add</Text>
      </Pressable>
      <Text style={{ color: "#6b7280" }}>{isExpanded ? "▲" : "▼"}</Text>
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

  const [seriesExpanded, setSeriesExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);
  const [showSeriesSheet, setShowSeriesSheet] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);

  // Optimistic order state for drag-and-drop
  const [seriesOrder, setSeriesOrder] = useState<AdminSeriesListItemDto[] | null>(null);
  const [collectionOrder, setCollectionOrder] = useState<AdminCollectionListItemDto[] | null>(null);

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
    setSeriesOrder(data);
    try {
      await updateSeries(data[to].id, { orderIndex: to });
    } catch {
      setSeriesOrder(prevOrder);
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
    setCollectionOrder(data);
    try {
      await updateCollection(data[to].id, { orderIndex: to });
    } catch {
      setCollectionOrder(prevOrder);
    }
  };

  if (!scholar) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 4 }}>{scholar.name}</Text>
        <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>@{scholar.slug}</Text>

        {/* Series section */}
        <SectionHeader
          title="Series"
          isExpanded={seriesExpanded}
          onToggle={() => setSeriesExpanded((v) => !v)}
          onAdd={() => setShowSeriesSheet(true)}
        />
        {seriesExpanded && (
          <DraggableList
            data={displaySeries}
            keyExtractor={(item) => item.id}
            onDragEnd={handleSeriesDragEnd}
            scrollEnabled={false}
            renderItem={({ item, drag, isActive }: RenderItemParams<AdminSeriesListItemDto>) => (
              <Pressable
                onLongPress={drag}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isActive ? "#3b82f6" : "#e5e5e5",
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: isActive ? "#eff6ff" : "#fff",
                  opacity: isActive ? 0.9 : 1,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {item.publishedLectureCount ?? 0} lectures · {item.status}
                </Text>
              </Pressable>
            )}
          />
        )}

        {/* Collections section */}
        <SectionHeader
          title="Collections"
          isExpanded={collectionsExpanded}
          onToggle={() => setCollectionsExpanded((v) => !v)}
          onAdd={() => setShowCollectionSheet(true)}
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
              <Pressable
                onLongPress={drag}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isActive ? "#3b82f6" : "#e5e5e5",
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: isActive ? "#eff6ff" : "#fff",
                  opacity: isActive ? 0.9 : 1,
                }}
              >
                <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.status}</Text>
              </Pressable>
            )}
          />
        )}

        <SeriesSheet
          isOpen={showSeriesSheet}
          scholarId={scholarId}
          onClose={() => setShowSeriesSheet(false)}
          onSaved={() => {
            setShowSeriesSheet(false);
            setSeriesOrder(null);
            refetchSeries();
          }}
        />
        <CollectionSheet
          isOpen={showCollectionSheet}
          scholarId={scholarId}
          onClose={() => setShowCollectionSheet(false)}
          onSaved={() => {
            setShowCollectionSheet(false);
            setCollectionOrder(null);
            refetchCollections();
          }}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
