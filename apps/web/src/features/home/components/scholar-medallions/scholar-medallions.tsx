"use client";

import { routes } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";

import styles from "./scholar-medallions.module.css";

const MAX_SCHOLARS = 8;

const SCHOLAR_TITLE_LABELS = {
  allamah: "Allamah",
  sheikh: "Shaykh",
  ustadh: "Ustadh",
  akh: "Brother",
} as const;

const LANGUAGE_LABELS = {
  ar: "Arabic",
  en: "English",
} as const;

export function ScholarMedallions() {
  const { t } = useTranslation();
  const { data, isLoading } = useInfiniteScholarsList();
  const scholars = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading && scholars.length === 0) {
    return (
      <section className={styles.section} aria-label={t("home.scholars.label", "Scholars")}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.scholars.title", "Scholars")}</h2>
          <Link href={routes.scholars.index} className={styles.seeAllLink}>
            {t("common.seeAll", "See all")}
          </Link>
        </div>
        <div className={styles.scrollRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`scholar-skeleton-${i}`} className={styles.skeletonMedallion}>
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonAvatar}`} />
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonName}`} />
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCount}`} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (scholars.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={t("home.scholars.label", "Scholars")}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("home.scholars.title", "Scholars")}</h2>
        <Link href={routes.scholars.index} className={styles.seeAllLink}>
          {t("common.seeAll", "See all")}
        </Link>
      </div>
      <div className={styles.scrollRow}>
        {scholars.slice(0, MAX_SCHOLARS).map((scholar) => (
          <Link
            key={scholar.id}
            href={routes.scholars.detail(scholar.slug)}
            className={styles.medallion}
            data-testid="scholar-medallion"
          >
            <span className={styles.avatarWrap}>
              <Avatar size="lg" className={styles.avatar}>
                {scholar.imageUrl && <AvatarImage src={scholar.imageUrl} alt="" />}
                <AvatarFallback>{scholar.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </span>
            <span className={styles.profileCopy}>
              {scholar.title && (
                <span className={styles.honorific}>{SCHOLAR_TITLE_LABELS[scholar.title]}</span>
              )}
              <span className={styles.name}>{scholar.name}</span>
              <span className={styles.metadata}>
                <span>{scholar.lectureCount} lectures</span>
                {scholar.mainLanguage && (
                  <span>{LANGUAGE_LABELS[scholar.mainLanguage] ?? scholar.mainLanguage}</span>
                )}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
