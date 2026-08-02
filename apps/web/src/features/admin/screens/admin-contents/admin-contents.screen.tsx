"use client";

import { queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { useAdminTopicsList } from "@sd/domain-content";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Content } from "@/features/admin/components/Content";
import { ListingsContent } from "@/features/admin/components/Content/Listing";
import { TopicsContent } from "@/features/admin/components/Content/Topic";
import { Button } from "@/shared/components/Button";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useDebouncedSearch } from "@/shared/hooks";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./admin-contents.screen.module.css";

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];

export function AdminContentsScreen() {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { ability } = useAbility();
  const queryClient = useQueryClient();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const activeTab = pathname.includes("/listings") ? "listings" : "topics";

  const { data: topicsData } = useAdminTopicsList();

  const topics = topicsData ?? EMPTY_TOPICS_ARRAY;

  // Topic modal state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopicSlug, setEditingTopicSlug] = useState<string | undefined>(undefined);

  const handleOpenAddTopic = () => {
    setEditingTopicSlug(undefined);
    setIsTopicModalOpen(true);
  };

  const handleTopicSaved = async (_slug: string) => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.topics.all }),
      queryClient.refetchQueries({ queryKey: queryKeys.admin.topics.all() }),
    ]);
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
                activeTab === "topics"
                  ? ability.can("create", "Topic") && (
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
                    )
                  : ability.can("create", "Listing") && (
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
                  key={editingTopicSlug}
                  isOpen={isTopicModalOpen}
                  onClose={() => {
                    setIsTopicModalOpen(false);
                    setEditingTopicSlug(undefined);
                  }}
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
