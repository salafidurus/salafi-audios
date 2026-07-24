"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { useTopicsList } from "@sd/domain-search";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { TopicsContent } from "@/features/admin/components/Content/Topic";
import { ListingsContent } from "@/features/admin/components/Content/Listing";
import { Content } from "@/features/admin/components/Content";
import { useDebouncedSearch } from "@/shared/hooks";
import styles from "./admin-contents.screen.module.css";

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];

export function AdminContentsScreen() {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const activeTab = pathname.includes("/listings") ? "listings" : "topics";

  const { data: topicsData } = useTopicsList();

  const topics = topicsData ?? EMPTY_TOPICS_ARRAY;

  // Topic modal state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopicSlug, setEditingTopicSlug] = useState<string | undefined>(undefined);

  const handleOpenAddTopic = () => {
    setEditingTopicSlug(undefined);
    setIsTopicModalOpen(true);
  };

  const handleTopicSaved = async (_slug: string) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.topics.list() });
  };

  // Listing modal state
  const [isListingAudioUploaderOpen, setIsListingAudioUploaderOpen] = useState(false);

  const handleOpenAddListing = () => {
    setIsListingAudioUploaderOpen(true);
  };

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.content}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader
              title={
                isMobile
                  ? t("admin.contents.titleMobile", "Content")
                  : activeTab === "topics"
                    ? t("admin.contents.topicManagement", "Topic Management")
                    : t("admin.contents.listingManagement", "Listing Management")
              }
              actions={
                activeTab === "topics" ? (
                  <PermissionGate requires="TOPICS_CREATE">
                    <Button
                      variant="primary"
                      size={!isMobile ? "md" : "sm"}
                      icon={<Plus size={!isMobile ? 18 : 16} />}
                      onClick={handleOpenAddTopic}
                    >
                      {!isMobile
                        ? t("admin.contents.addTopic", "Add Topic")
                        : t("admin.contents.addTopicMobile", "Topic")}
                    </Button>
                  </PermissionGate>
                ) : (
                  <PermissionGate requires="LISTINGS_CREATE">
                    <Button
                      variant="primary"
                      size={!isMobile ? "md" : "sm"}
                      icon={<Plus size={!isMobile ? 18 : 16} />}
                      onClick={handleOpenAddListing}
                    >
                      {!isMobile
                        ? t("admin.contents.addListing", "Add Listing")
                        : t("admin.contents.addListingMobile", "Listing")}
                    </Button>
                  </PermissionGate>
                )
              }
            />

            <Search.Bar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={
                activeTab === "topics"
                  ? t("admin.contents.searchPlaceholderTopics", "Search topics...")
                  : t("admin.contents.searchPlaceholderListings", "Search listings...")
              }
            />
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            {activeTab === "topics" && (
              <>
                <TopicsContent
                  searchQuery={searchQuery}
                  debouncedSearch={debouncedSearch}
                  topics={topics}
                  onEditTopic={(topic) => {
                    setEditingTopicSlug(topic.slug);
                    setIsTopicModalOpen(true);
                  }}
                />
                <Content.TopicModal
                  isOpen={isTopicModalOpen}
                  onClose={() => setIsTopicModalOpen(false)}
                  onSaved={handleTopicSaved}
                  topicSlug={editingTopicSlug}
                />
              </>
            )}
            {activeTab === "listings" && (
              <ListingsContent
                debouncedSearch={debouncedSearch}
                isAudioUploaderOpen={isListingAudioUploaderOpen}
                onAudioUploaderOpenChange={setIsListingAudioUploaderOpen}
              />
            )}
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
      </div>

      <ScrollToTopButton />
    </ScreenView>
  );
}
