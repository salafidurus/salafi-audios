"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import {
  useApiQuery,
  queryKeys,
  httpClient,
  endpoints,
  type TopicDetailDto,
} from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { Search } from "@/shared/components/Search";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { TopicsContent, ListingsContent } from "@/features/admin/components/Contents";
import { useDebouncedSearch } from "@/shared/hooks";
import styles from "./admin-contents.screen.module.css";

const EMPTY_TOPICS_ARRAY: TopicDetailDto[] = [];

export function AdminContentsScreen() {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const { t } = useTranslation();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const activeTab = pathname.includes("/listings") ? "listings" : "topics";

  const { data: topicsData } = useApiQuery<TopicDetailDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  const topics = topicsData ?? EMPTY_TOPICS_ARRAY;

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.content}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader
              title={
                isMobile
                  ? t("admin.contents.titleMobile", "Content")
                  : t("admin.contents.title", "Content Management")
              }
              actions={
                activeTab === "topics" ? (
                  <PermissionGate requires="TOPICS_CREATE">
                    <Button
                      variant="primary"
                      size={!isMobile ? "md" : "sm"}
                      icon={<Plus size={!isMobile ? 18 : 16} />}
                      onClick={() => {}}
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
                      onClick={() => {}}
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
              <TopicsContent
                searchQuery={searchQuery}
                debouncedSearch={debouncedSearch}
                isMobile={isMobile}
                topics={topics}
              />
            )}
            {activeTab === "listings" && (
              <ListingsContent debouncedSearch={debouncedSearch} isMobile={isMobile} />
            )}
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
      </div>

      <ScrollToTopButton />
    </ScreenView>
  );
}
