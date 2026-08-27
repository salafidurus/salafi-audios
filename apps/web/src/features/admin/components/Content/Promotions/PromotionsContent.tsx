"use client";

import { useAbility } from "@sd/domain-account";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  fetchAdminLectures,
  getAdminPromotions,
  updateAdminPromotions,
} from "@/features/admin/api/admin-lectures.api";
import { AdminAccessState } from "@/features/admin/components/AdminAccessState/AdminAccessState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

import { EditorsPicksSection } from "./EditorsPicksSection";
import styles from "./promotions-content.module.css";
import { PromotionsHeroSection, type PromotionListingOption } from "./PromotionsHeroSection";

function buildPromotionPayload(
  heroListingId: string,
  heroHeadline: string,
  editorsPicks: PromotionListingOption[],
) {
  return {
    heroListingId: heroListingId || null,
    heroHeadline: heroHeadline || null,
    editorsPickListingIds: editorsPicks.map((pick) => pick.id),
  };
}

function hasSearchTerm(value: string) {
  return value.length > 0;
}

function findActiveHero(
  options: PromotionListingOption[],
  selectedId: string,
  fallback: PromotionListingOption | undefined,
) {
  return options.find((option) => option.id === selectedId) ?? fallback;
}

export function PromotionsContent() {
  const { t } = useTranslation();
  const { ability } = useAbility();
  const canManagePromotions = ability.can("write", "Listing");
  const [heroSearch, setHeroSearch] = useState("");
  const [picksSearch, setPicksSearch] = useState("");
  const [selectedHeroSearchId, setSelectedHeroSearchId] = useState("");
  const [selectedPicksSearchId, setSelectedPicksSearchId] = useState("");
  const [heroListingId, setHeroListingId] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [editorsPicks, setEditorsPicks] = useState<PromotionListingOption[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<"success" | "error" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    data: promotions,
    refetch: refetchPromotions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: getAdminPromotions,
    enabled: canManagePromotions,
  });

  const { data: heroListingsData } = useQuery({
    queryKey: ["admin", "listings", "search-hero", heroSearch],
    queryFn: () => fetchAdminLectures({ search: heroSearch }),
    enabled: hasSearchTerm(heroSearch),
  });
  const { data: picksListingsData } = useQuery({
    queryKey: ["admin", "listings", "search-picks", picksSearch],
    queryFn: () => fetchAdminLectures({ search: picksSearch }),
    enabled: hasSearchTerm(picksSearch),
  });
  const heroSearchOptions = heroListingsData?.items ?? [];
  const picksSearchOptions = picksListingsData?.items ?? [];

  useEffect(() => {
    if (!promotions) return;
    setHeroListingId(promotions.hero?.listingId ?? "");
    setHeroHeadline(promotions.hero?.headline ?? "");
    setEditorsPicks(
      promotions.editorsPicks?.map((pick: { listing: PromotionListingOption }) => pick.listing) ??
        [],
    );
  }, [promotions]);

  const mutation = useMutation({
    mutationFn: updateAdminPromotions,
    onSuccess: () => {
      setSaveFeedback("success");
      setSaveError(null);
      void refetchPromotions();
    },
    onError: () => {
      setSaveFeedback("error");
      setSaveError(
        t("admin.promotions.errorDetails", "Please try again or contact an administrator."),
      );
    },
  });

  const handleSave = () => {
    setSaveFeedback(null);
    setSaveError(null);
    mutation.mutate(buildPromotionPayload(heroListingId, heroHeadline, editorsPicks));
  };

  const activeHeroListing = findActiveHero(
    heroSearchOptions,
    heroListingId,
    promotions?.hero?.listing,
  );

  if (!canManagePromotions) return <AdminAccessState status="denied" />;
  if (isLoading) return <div className={styles.loading}>{t("common.loading", "Loading...")}</div>;
  if (isError) {
    return (
      <Alert variant="destructive" className={styles.errorState}>
        <AlertDescription>{t("admin.promotions.loadError")}</AlertDescription>
        <Button variant="secondary" size="sm" onClick={() => void refetchPromotions()}>
          {t("admin.promotions.retry")}
        </Button>
      </Alert>
    );
  }

  return (
    <div className={styles.container}>
      <PromotionsHeroSection
        search={heroSearch}
        onSearchChange={setHeroSearch}
        selectedSearchId={selectedHeroSearchId}
        onSelectedSearchIdChange={setSelectedHeroSearchId}
        onListingIdChange={setHeroListingId}
        headline={heroHeadline}
        onHeadlineChange={setHeroHeadline}
        searchOptions={heroSearchOptions}
        activeListing={activeHeroListing}
      />
      <EditorsPicksSection
        search={picksSearch}
        onSearchChange={setPicksSearch}
        selectedSearchId={selectedPicksSearchId}
        onSelectedSearchIdChange={setSelectedPicksSearchId}
        searchOptions={picksSearchOptions}
        editorsPicks={editorsPicks}
        onEditorsPicksChange={setEditorsPicks}
        onError={(message) => {
          setSaveFeedback("error");
          setSaveError(message);
        }}
      />
      <div className={styles.footerActions}>
        <div
          className={styles.feedback}
          aria-live="polite"
          role={saveFeedback === "error" ? "alert" : "status"}
        >
          {saveFeedback === "success" &&
            t("admin.promotions.success", "Promotions updated successfully.")}
          {saveFeedback === "error" &&
            t("admin.promotions.error", "Promotions could not be saved.")}
          {saveError && <span>{saveError}</span>}
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="ml-auto"
        >
          {mutation.isPending ? t("common.saving", "Saving...") : t("common.save", "Save Curation")}
        </Button>
      </div>
    </div>
  );
}
