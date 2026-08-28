import { getLocalizedName } from "@sd/core-i18n";
import { useTopicsList } from "@sd/domain-search";
import { useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import styles from "./category-chips.module.css";

/** Documents this module's responsibility and public boundary. */
export type CategoryChipsProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

/** Documents the intent and contract of this declaration. */
export function CategoryChips({ value, onValueChange }: CategoryChipsProps = {}) {
  const { i18n, t } = useTranslation();
  const { data: topics = [], isLoading } = useTopicsList();

  const chips = useMemo(() => {
    return topics
      .toSorted((a, b) =>
        getLocalizedName(a.name, i18n.language).localeCompare(
          getLocalizedName(b.name, i18n.language),
        ),
      )
      .map((topic) => ({
        slug: topic.slug,
        label: getLocalizedName(topic.name, i18n.language),
      }));
  }, [topics, i18n.language]);

  if (isLoading && topics.length === 0) {
    return (
      <Tabs
        defaultValue="all"
        className={styles.chipsRow}
        aria-label={t("home.categories.label", "Browse by topic")}
      >
        <TabsList aria-label={t("home.categories.label", "Browse by topic")}>
          <TabsTrigger value="all" data-testid="category-chip-all">
            {t("home.categories.all", "All")}
          </TabsTrigger>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`chip-skeleton-${i}`}
              className={`${styles.skeletonLine} ${styles.skeletonChip}`}
              aria-hidden="true"
            />
          ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Tabs
      defaultValue="all"
      value={value}
      onValueChange={onValueChange}
      className={styles.chipsRow}
      aria-label={t("home.categories.label", "Browse by topic")}
    >
      <TabsList aria-label={t("home.categories.label", "Browse by topic")}>
        <TabsTrigger value="all" data-testid="category-chip-all">
          {t("home.categories.all", "All")}
        </TabsTrigger>
        {chips.map((chip) => (
          <TabsTrigger key={chip.slug} value={chip.slug} data-testid="category-chip">
            {chip.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
