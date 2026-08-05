import { routes } from "@sd/core-contracts";
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
import Link from "next/link";
import { useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./category-chips.module.css";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  aqeedah: Shield,
  fiqh: Scale,
  hadith: MessageSquareText,
  nahw: SpellCheck2,
  seerah: Footprints,
  tafsir: BookOpen,
  "da'wah": GraduationCap,
};

export function CategoryChips() {
  const { i18n, t } = useTranslation();
  const { data: topics = [] } = useTopicsList();

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
        Icon: TOPIC_ICONS[topic.slug],
      }));
  }, [topics, i18n.language]);

  return (
    <nav className={styles.chipsRow} aria-label={t("home.categories.label", "Browse by topic")}>
      <Link
        href={routes.search}
        className={`${styles.chip} ${styles.chipAllActive}`}
        data-testid="category-chip-all"
      >
        <BookOpen size={15} strokeWidth={2} className={styles.chipIconActive} />
        {t("home.categories.all", "All")}
      </Link>
      {chips.map((chip) => {
        const Icon = chip.Icon;
        return (
          <Link
            key={chip.slug}
            href={`${routes.search}?topic=${chip.slug}`}
            className={styles.chip}
            data-testid="category-chip"
          >
            {Icon && <Icon size={15} strokeWidth={2} className={styles.chipIcon} />}
            {chip.label}
          </Link>
        );
      })}
    </nav>
  );
}
