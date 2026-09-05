/** Documents this module's responsibility and public boundary. */
"use client";

import { Award, Star } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { InputField } from "@/shared/components/ui/input-field";

import styles from "./promotions-content.module.css";

/** A listing option used by promotion search controls and the active selection summary. */
export type PromotionListingOption = { id: string; title: string; scholarName: string };

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSearchId: string;
  onSelectedSearchIdChange: (value: string) => void;
  onListingIdChange: (value: string) => void;
  headline: string;
  onHeadlineChange: (value: string) => void;
  searchOptions: PromotionListingOption[];
  activeListing?: PromotionListingOption;
};

/** Renders the searchable hero-listing selector and its optional headline field. */
export function PromotionsHeroSection({
  search,
  onSearchChange,
  selectedSearchId,
  onSelectedSearchIdChange,
  onListingIdChange,
  headline,
  onHeadlineChange,
  searchOptions,
  activeListing,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card className={styles.section}>
      <CardHeader className={styles.sectionHeader}>
        <Star className={styles.sectionIcon} size={20} />
        <CardTitle>{t("admin.promotions.featuredHeroTitle", "Featured Hero Curation")}</CardTitle>
      </CardHeader>
      <CardDescription className={styles.sectionDesc}>
        {t(
          "admin.promotions.featuredHeroDesc",
          "Select the main listing highlighted at the top of the homepage hero banner.",
        )}
      </CardDescription>
      <CardContent className={styles.sectionContent}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="hero-search-input">
            {t("admin.promotions.heroSearch", "Search & Select Listing")}
          </label>
          <InputField
            id="hero-search-input"
            value={search}
            onChange={(value) => {
              onSearchChange(value);
              onSelectedSearchIdChange("");
            }}
            placeholder={t(
              "admin.promotions.searchPlaceholder",
              "Search lectures by title or scholar...",
            )}
          />
          {searchOptions.length > 0 && (
            <select
              id="hero-select-dropdown"
              aria-label={t("admin.promotions.selectMatch", "Select matching listing")}
              className={styles.select}
              value={selectedSearchId}
              onChange={(event) => {
                const value = event.target.value;
                onSelectedSearchIdChange(value);
                onListingIdChange(value);
              }}
            >
              <option value="">
                -- {t("admin.promotions.selectMatch", "Select matching listing")} --
              </option>
              {searchOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} ({option.scholarName})
                </option>
              ))}
            </select>
          )}
        </div>
        {activeListing && (
          <div className={styles.activePromoCard}>
            <Award className="text-[var(--action-primary)]" size={24} />
            <div className={styles.promoDetails}>
              <span className={styles.promoTag}>
                {t("admin.promotions.currentlySelected", "Active Hero Selection")}
              </span>
              <p className={styles.promoTitle}>{activeListing.title}</p>
              <p className={styles.promoSub}>{activeListing.scholarName}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onListingIdChange("");
                onSearchChange("");
                onSelectedSearchIdChange("");
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
            value={headline}
            onChange={onHeadlineChange}
            placeholder={t("admin.promotions.headlinePlaceholder", "e.g. Featured Lecture")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
