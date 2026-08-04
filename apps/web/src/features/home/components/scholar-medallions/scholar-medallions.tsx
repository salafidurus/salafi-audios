"use client";

import { routes } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

import styles from "./scholar-medallions.module.css";

const MAX_SCHOLARS = 8;

export function ScholarMedallions() {
  const { t } = useTranslation();
  const { data } = useInfiniteScholarsList();
  const scholars = data?.pages.flatMap((page) => page.items) ?? [];

  if (scholars.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={t("home.scholars.label", "Scholars")}>
      <h2 className={styles.sectionTitle}>{t("home.scholars.title", "Scholars")}</h2>
      <div className={styles.scrollRow}>
        {scholars.slice(0, MAX_SCHOLARS).map((scholar) => (
          <Link
            key={scholar.id}
            href={routes.scholars.detail(scholar.slug)}
            className={styles.medallion}
            data-testid="scholar-medallion"
          >
            <span className={styles.avatarWrap}>
              <UserAvatar image={scholar.imageUrl ?? null} name={scholar.name} size={64} />
            </span>
            <span className={styles.name}>{scholar.name}</span>
            <span className={styles.count}>{scholar.lectureCount} lectures</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
