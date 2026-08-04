import { routes } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { useTopicsList } from "@sd/domain-search";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./category-chips.module.css";

export function CategoryChips() {
  const { i18n, t } = useTranslation();
  const { data: topics = [] } = useTopicsList();

  const chips = topics
    .toSorted((a, b) =>
      getLocalizedName(a.name, i18n.language).localeCompare(
        getLocalizedName(b.name, i18n.language),
      ),
    )
    .map((topic) => ({
      slug: topic.slug,
      label: getLocalizedName(topic.name, i18n.language),
    }));

  return (
    <nav className={styles.chipsRow} aria-label={t("home.categories.label", "Browse by topic")}>
      {chips.map((chip) => (
        <Link
          key={chip.slug}
          href={`${routes.search}?topic=${chip.slug}`}
          className={styles.chip}
          data-testid="category-chip"
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}
