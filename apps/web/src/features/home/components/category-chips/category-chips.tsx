import { getLocalizedName } from "@sd/core-i18n";
import { useTopicsList } from "@sd/domain-search";
import {
  BookOpen,
  type LucideIcon,
  Footprints,
  GraduationCap,
  MessageSquareText,
  Scale,
  Shield,
  SpellCheck2,
} from "lucide-react";
import { useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import styles from "./category-chips.module.css";

const TOPIC_ICONS = {
  aqeedah: Shield,
  fiqh: Scale,
  hadith: MessageSquareText,
  nahw: SpellCheck2,
  seerah: Footprints,
  tafsir: BookOpen,
  "da'wah": GraduationCap,
} satisfies Record<string, LucideIcon>;

type TopicIconKey = keyof typeof TOPIC_ICONS;

function isTopicIconKey(value: string): value is TopicIconKey {
  return value in TOPIC_ICONS;
}

export type CategoryChipsProps = {
  value?: string;
  onValueChange?: (value: string) => void;
};

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
        Icon: isTopicIconKey(topic.slug) ? TOPIC_ICONS[topic.slug] : undefined,
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
            <BookOpen size={15} strokeWidth={2} aria-hidden="true" />
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
          <BookOpen size={15} strokeWidth={2} aria-hidden="true" />
          {t("home.categories.all", "All")}
        </TabsTrigger>
        {chips.map((chip) => {
          const Icon = chip.Icon;
          return (
            <TabsTrigger key={chip.slug} value={chip.slug} data-testid="category-chip">
              {Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
              {chip.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
