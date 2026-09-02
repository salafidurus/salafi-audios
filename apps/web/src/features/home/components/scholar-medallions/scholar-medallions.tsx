/** Documents this module's responsibility and public boundary. */
"use client";

import { routes } from "@sd/core-contracts";
import { getScholarTitleLabel } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppAvatar } from "@/shared/components/app-avatar";
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

type ScholarMedallionsProps = {
  featuredScholarSlug?: string;
};

function SectionHeader({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{t("home.scholars.title", "Scholars")}</h2>
      <Link href={routes.scholars.index} className={styles.seeAllLink}>
        {t("common.seeAll", "See all")}
      </Link>
    </div>
  );
}

function LoadingScholars({ t }: { t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <section className={styles.section} aria-label={t("home.scholars.label", "Scholars")}>
      <SectionHeader t={t} />
      <div className={styles.scrollRow}>
        <div className={styles.scrollTrack}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`scholar-skeleton-${i}`} className={styles.skeletonMedallion}>
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonAvatar}`} />
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonName}`} />
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCount}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedScholar({
  scholar,
  t,
}: {
  scholar: NonNullable<
    ReturnType<typeof useInfiniteScholarsList>["data"]
  >["pages"][number]["items"][number];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className={styles.featuredScholar}>
      <div className={styles.featuredCopy}>
        <p className={styles.featuredEyebrow}>FEATURED SENIOR SCHOLAR</p>
        {scholar.title && (
          <p className={styles.featuredHonorific}>{getScholarTitleLabel(scholar.title, t)}</p>
        )}
        <h3 className={styles.featuredName}>{scholar.name}</h3>
        <p className={styles.featuredMetadata}>
          {scholar.lectureCount} lectures
          {scholar.mainLanguage && (
            <>
              <span aria-hidden="true"> · </span>
              {LANGUAGE_LABELS[scholar.mainLanguage] ?? scholar.mainLanguage}
            </>
          )}
        </p>
        <Link href={routes.scholars.detail(scholar.slug)} className={styles.featuredLink}>
          Explore scholar
        </Link>
      </div>
      <div className={styles.featuredAvatar}>
        <AppAvatar
          image={scholar.imageUrl}
          text={scholar.name}
          fill
          className={styles.avatarImage}
          sizes="(max-width: 640px) 34vw, 18vw"
        />
      </div>
    </div>
  );
}

function ScholarMedallion({
  scholar,
}: {
  scholar: NonNullable<
    ReturnType<typeof useInfiniteScholarsList>["data"]
  >["pages"][number]["items"][number];
}) {
  return (
    <Link
      href={routes.scholars.detail(scholar.slug)}
      className={styles.medallion}
      data-testid="scholar-medallion"
    >
      <span className={styles.avatarWrap}>
        <AppAvatar
          image={scholar.imageUrl}
          text={scholar.name}
          fill
          className={styles.avatarImage}
          sizes="(max-width: 640px) 34vw, 18vw"
        />
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
  );
}

type ScholarListItem = NonNullable<
  ReturnType<typeof useInfiniteScholarsList>["data"]
>["pages"][number]["items"][number];

function selectScholarGroups(scholars: ScholarListItem[], featuredScholarSlug?: string) {
  const featuredScholar = featuredScholarSlug
    ? scholars.find((scholar) => scholar.slug === featuredScholarSlug)
    : undefined;

  return {
    featuredScholar,
    regularScholars: featuredScholar
      ? scholars.filter((scholar) => scholar.id !== featuredScholar.id)
      : scholars,
  };
}

export function ScholarMedallions({ featuredScholarSlug }: ScholarMedallionsProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useInfiniteScholarsList();
  const scholars = data?.pages.flatMap((page) => page.items) ?? [];
  const { featuredScholar, regularScholars } = selectScholarGroups(scholars, featuredScholarSlug);

  if (isLoading && scholars.length === 0) {
    return <LoadingScholars t={t} />;
  }

  if (scholars.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={t("home.scholars.label", "Scholars")}>
      <SectionHeader t={t} />
      {featuredScholar && <FeaturedScholar scholar={featuredScholar} t={t} />}
      <div className={styles.scrollRow}>
        <div className={styles.scrollTrack}>
          {regularScholars.slice(0, MAX_SCHOLARS).map((scholar) => (
            <ScholarMedallion key={scholar.id} scholar={scholar} />
          ))}
        </div>
      </div>
    </section>
  );
}
