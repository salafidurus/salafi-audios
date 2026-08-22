"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Trash2, Plus, Star, Award } from "lucide-react";
import { useState, useEffect } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  getAdminPromotions,
  updateAdminPromotions,
  fetchAdminLectures,
} from "@/features/admin/api/admin-lectures.api";
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/ui/input-field";

import styles from "./promotions-content.module.css";

export function PromotionsContent() {
  const { t } = useTranslation();

  // Search queries for autocomplete
  const [heroSearch, setHeroSearch] = useState("");
  const [picksSearch, setPicksSearch] = useState("");

  // Select choices
  const [selectedHeroSearchId, setSelectedHeroSearchId] = useState("");
  const [selectedPicksSearchId, setSelectedPicksSearchId] = useState("");

  // Saved/local states
  const [heroListingId, setHeroListingId] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]);

  // 1. Fetch current promotions
  const {
    data: promotions,
    refetch: refetchPromotions,
    isLoading,
  } = useQuery({
    queryKey: ["admin", "promotions"],
    queryFn: getAdminPromotions,
  });

  // 2. Fetch search options for Hero
  const { data: heroListingsData } = useQuery({
    queryKey: ["admin", "listings", "search-hero", heroSearch],
    queryFn: () => fetchAdminLectures({ search: heroSearch }),
    enabled: heroSearch.length > 0,
  });
  const heroSearchOptions = heroListingsData?.items ?? [];

  // 3. Fetch search options for Editors' Picks
  const { data: picksListingsData } = useQuery({
    queryKey: ["admin", "listings", "search-picks", picksSearch],
    queryFn: () => fetchAdminLectures({ search: picksSearch }),
    enabled: picksSearch.length > 0,
  });
  const picksSearchOptions = picksListingsData?.items ?? [];

  // Populate form state when promotions data loads
  useEffect(() => {
    if (promotions) {
      setHeroListingId(promotions.hero?.listingId ?? "");
      setHeroHeadline(promotions.hero?.headline ?? "");
      setEditorsPicks(promotions.editorsPicks?.map((p: any) => p.listing) ?? []);
    }
  }, [promotions]);

  // Mutation to save promotions
  const mutation = useMutation({
    mutationFn: updateAdminPromotions,
    onSuccess: () => {
      alert(t("admin.promotions.success", "Promotions updated successfully!"));
      void refetchPromotions();
    },
    onError: (err: any) => {
      alert(t("admin.promotions.error", `Failed to save promotions: ${err.message || err}`));
    },
  });

  const handleSave = () => {
    mutation.mutate({
      heroListingId: heroListingId || null,
      heroHeadline: heroHeadline || null,
      editorsPickListingIds: editorsPicks.map((p) => p.id),
    });
  };

  const handleAddPick = () => {
    if (!selectedPicksSearchId) return;
    const match = picksSearchOptions.find((o: any) => o.id === selectedPicksSearchId);
    if (!match) return;

    // Check if already in list
    if (editorsPicks.some((p) => p.id === match.id)) {
      alert(t("admin.promotions.alreadyAdded", "This listing is already in Editors' Picks."));
      return;
    }

    setEditorsPicks((prev) => [...prev, match]);
    setPicksSearch("");
    setSelectedPicksSearchId("");
  };

  const handleRemovePick = (id: string) => {
    setEditorsPicks((prev) => prev.filter((p) => p.id !== id));
  };

  // Find active hero listing info for display
  const activeHeroListing =
    heroSearchOptions.find((o: any) => o.id === heroListingId) || promotions?.hero?.listing;

  if (isLoading) {
    return <div className={styles.loading}>{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Star className={styles.sectionIcon} size={20} />
          <h2>{t("admin.promotions.featuredHeroTitle", "Featured Hero Curation")}</h2>
        </div>
        <p className={styles.sectionDesc}>
          {t(
            "admin.promotions.featuredHeroDesc",
            "Select the main listing highlighted at the top of the homepage hero banner.",
          )}
        </p>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="hero-search-input">
            {t("admin.promotions.heroSearch", "Search & Select Listing")}
          </label>
          <InputField
            id="hero-search-input"
            value={heroSearch}
            onChange={(val) => {
              setHeroSearch(val);
              setSelectedHeroSearchId("");
            }}
            placeholder={t(
              "admin.promotions.searchPlaceholder",
              "Search lectures by title or scholar...",
            )}
          />
          {heroSearchOptions.length > 0 && (
            <select
              id="hero-select-dropdown"
              aria-label={t("admin.promotions.selectMatch", "Select matching listing")}
              className={styles.select}
              value={selectedHeroSearchId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedHeroSearchId(val);
                setHeroListingId(val);
              }}
            >
              <option value="">
                -- {t("admin.promotions.selectMatch", "Select matching listing")} --
              </option>
              {heroSearchOptions.map((opt: any) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} ({opt.scholarName})
                </option>
              ))}
            </select>
          )}
        </div>

        {activeHeroListing && (
          <div className={styles.activePromoCard}>
            <Award className="text-[var(--action-primary)]" size={24} />
            <div className={styles.promoDetails}>
              <span className={styles.promoTag}>
                {t("admin.promotions.currentlySelected", "Active Hero Selection")}
              </span>
              <p className={styles.promoTitle}>{activeHeroListing.title}</p>
              <p className={styles.promoSub}>{activeHeroListing.scholarName}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setHeroListingId("");
                setHeroSearch("");
                setSelectedHeroSearchId("");
              }}
            >
              {t("common.clear", "Clear")}
            </Button>
          </div>
        )}

        <div className={styles.row}>
          <label className={styles.label} htmlFor="hero-headline-input">
            {t("admin.promotions.heroHeadline", "Featured Headline/Text")}
          </label>
          <InputField
            id="hero-headline-input"
            value={heroHeadline}
            onChange={setHeroHeadline}
            placeholder={t("admin.promotions.headlinePlaceholder", "e.g. Featured Lecture")}
          />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Star className={styles.sectionIcon} size={20} />
          <h2>{t("admin.promotions.editorsPicksTitle", "Editors' Picks Curation")}</h2>
        </div>
        <p className={styles.sectionDesc}>
          {t(
            "admin.promotions.editorsPicksDesc",
            "Manage the listings highlighted inside the Editors' Picks feed widget on the homepage.",
          )}
        </p>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="picks-search-input">
            {t("admin.promotions.addPickLabel", "Add Listing to Picks")}
          </label>
          <div className={styles.searchAddRow}>
            <InputField
              id="picks-search-input"
              value={picksSearch}
              onChange={(val) => {
                setPicksSearch(val);
                setSelectedPicksSearchId("");
              }}
              placeholder={t(
                "admin.promotions.searchPlaceholder",
                "Search lectures by title or scholar...",
              )}
            />
            <Button
              variant="primary"
              onClick={handleAddPick}
              disabled={!selectedPicksSearchId}
              icon={<Plus size={16} />}
            >
              {t("common.add", "Add")}
            </Button>
          </div>
          {picksSearchOptions.length > 0 && (
            <select
              id="picks-select-dropdown"
              aria-label={t("admin.promotions.selectMatch", "Select matching listing")}
              className={styles.select}
              value={selectedPicksSearchId}
              onChange={(e) => setSelectedPicksSearchId(e.target.value)}
            >
              <option value="">
                -- {t("admin.promotions.selectMatch", "Select matching listing")} --
              </option>
              {picksSearchOptions.map((opt: any) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title} ({opt.scholarName})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.picksList}>
          {editorsPicks.length === 0 ? (
            <p className={styles.emptyPicks}>
              {t("admin.promotions.emptyPicks", "No Editors' Picks selected yet.")}
            </p>
          ) : (
            editorsPicks.map((pick, idx) => (
              <div key={pick.id} className={styles.pickRow}>
                <span className={styles.pickIndex}>#{idx + 1}</span>
                <div className={styles.pickDetails}>
                  <p className={styles.pickTitle}>{pick.title}</p>
                  <p className={styles.pickSub}>{pick.scholarName}</p>
                </div>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemovePick(pick.id)}
                  aria-label={t("admin.promotions.removePick", "Remove Pick")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.footerActions}>
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
