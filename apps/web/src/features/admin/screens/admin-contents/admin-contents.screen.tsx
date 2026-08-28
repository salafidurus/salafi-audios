"use client";

import { queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { useAbility } from "@sd/domain-account";
import { useAdminTopicsList } from "@sd/domain-content";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Content } from "@/features/admin/components/Content";
import { ListingsContent } from "@/features/admin/components/Content/Listing";
import { PromotionsContent } from "@/features/admin/components/Content/Promotions/PromotionsContent";
import { TopicsContent } from "@/features/admin/components/Content/Topic";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedSearch } from "@/shared/hooks";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./admin-contents.screen.module.css";

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];
type ContentTab = "listings" | "topics" | "promotions";

type Translate = (key: string, fallback: string) => string;

function getContentTitle(isMobile: boolean, activeTab: ContentTab, t: Translate): string {
  if (isMobile) return t("admin.contents.titleMobile", "Content");
  if (activeTab === "topics") return t("admin.contents.topicManagement", "Topic Management");
  if (activeTab === "listings") return t("admin.contents.listingManagement", "Listing Management");
  return t("admin.contents.promotionsManagement", "Promotions Management");
}

type ContentActionsProps = {
  isMobile: boolean;
  activeTab: ContentTab;
  canCreate: boolean;
  onClick: () => void;
  t: Translate;
};

function getCreateActionCopy(isMobile: boolean, isTopic: boolean) {
  if (isTopic) {
    return isMobile
      ? { key: "admin.contents.addTopicMobile", fallback: "Topic" }
      : { key: "admin.contents.addTopic", fallback: "Add Topic" };
  }
  return isMobile
    ? { key: "admin.contents.addListingMobile", fallback: "Listing" }
    : { key: "admin.contents.addListing", fallback: "Add Listing" };
}

function ContentActions({ isMobile, activeTab, canCreate, onClick, t }: ContentActionsProps) {
  if (!canCreate || activeTab === "promotions") return null;
  const isTopic = activeTab === "topics";
  const copy = getCreateActionCopy(isMobile, isTopic);
  return (
    <Button
      variant="primary"
      size={isMobile ? "sm" : "md"}
      icon={<Plus size={isMobile ? 16 : 18} />}
      onClick={onClick}
    >
      {t(copy.key, copy.fallback)}
    </Button>
  );
}

export function AdminContentsScreen() {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { ability } = useAbility();
  const queryClient = useQueryClient();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const [activeTab, setActiveTab] = useState<ContentTab>("listings");

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
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            // SAFETY: Radix Tabs emits only the three values declared in CONTENT_TABS.
            setActiveTab(value as ContentTab);
          }}
          orientation="horizontal"
        >
          <StickyHeaderLayout>
            <StickyHeaderLayout.Header>
              <PageHeader
                title={getContentTitle(isMobile, activeTab, t)}
                actions={
                  <ContentActions
                    isMobile={isMobile}
                    activeTab={activeTab}
                    canCreate={
                      activeTab === "topics"
                        ? ability.can("create", "Topic")
                        : ability.can("create", "Listing")
                    }
                    onClick={activeTab === "topics" ? handleOpenAddTopic : handleOpenAddListing}
                    t={t}
                  />
                }
              />

              {/* Sub-navigation tab switcher */}
              <div className={styles.tabViewport}>
                <TabsList
                  variant="line"
                  className={styles.tabBar}
                  aria-label={t("admin.contents.sectionsLabel")}
                >
                  <TabsTrigger value="listings" className={styles.tabButton}>
                    {t("admin.contents.tabListings")}
                  </TabsTrigger>
                  <TabsTrigger value="topics" className={styles.tabButton}>
                    {t("admin.contents.tabTopics")}
                  </TabsTrigger>
                  <TabsTrigger value="promotions" className={styles.tabButton}>
                    {t("admin.contents.tabPromotions")}
                  </TabsTrigger>
                </TabsList>
              </div>

              {activeTab !== "promotions" && (
                <Search.Bar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={
                    activeTab === "topics"
                      ? t("admin.contents.searchPlaceholderTopics", "Search topics...")
                      : t("admin.contents.searchPlaceholderListings", "Search listings...")
                  }
                />
              )}
            </StickyHeaderLayout.Header>

            <StickyHeaderLayout.Content>
              <TabsContent value="topics">
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
              </TabsContent>
              <TabsContent value="listings">
                <ListingsContent
                  debouncedSearch={debouncedSearch}
                  isAudioUploaderOpen={isListingAudioUploaderOpen}
                  onAudioUploaderOpenChange={setIsListingAudioUploaderOpen}
                />
              </TabsContent>
              <TabsContent value="promotions">
                <PromotionsContent />
              </TabsContent>
            </StickyHeaderLayout.Content>
          </StickyHeaderLayout>
        </Tabs>
      </div>

      <ScrollToTopButton />
    </ScreenView>
  );
}
