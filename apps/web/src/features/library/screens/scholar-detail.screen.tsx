import { publicApi, PublicApiError } from "@/features/home/api/public-api";
import { ScholarProfileHeader } from "@/features/library/components/scholar-profile/scholar-profile-header";
import { ScholarSidebar } from "@/features/library/components/scholar-sidebar/scholar-sidebar";
import { canonical } from "@/features/library/utils/seo";
import { tryGetWebEnv } from "@/shared/utils/env";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScholarDetailClient } from "./scholar-detail.client";
import styles from "./scholar-detail.screen.module.css";

type ScholarPageData = {
  scholar: Awaited<ReturnType<typeof publicApi.getScholar>>;
  stats: Awaited<ReturnType<typeof publicApi.getScholarStats>>;
  collections: Awaited<ReturnType<typeof publicApi.listScholarCollections>>;
  series: Awaited<ReturnType<typeof publicApi.listScholarSeries>>;
  lectures: Awaited<ReturnType<typeof publicApi.listScholarLectures>>;
  popular: Awaited<ReturnType<typeof publicApi.listScholarPopular>>;
};

type ScholarRouteProps = {
  params: Promise<{ scholarSlug: string }>;
};

async function loadScholarPage(scholarSlug: string): Promise<ScholarPageData> {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, stats, collections, series, lectures, popular] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.getScholarStats(scholarSlug),
      publicApi.listScholarCollections(scholarSlug),
      publicApi.listScholarSeries(scholarSlug),
      publicApi.listScholarLectures(scholarSlug),
      publicApi.listScholarPopular(scholarSlug, 5),
    ]);

    return {
      scholar,
      stats,
      collections,
      series: series.filter(
        (item: Awaited<ReturnType<typeof publicApi.listScholarSeries>>[number]) =>
          !item.collectionId,
      ),
      lectures,
      popular,
    };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }

    // Treat non-404 errors (including missing API env) as not-found for build/runtime resilience.
    notFound();
  }
}

export async function getScholarMetadata({ params }: ScholarRouteProps): Promise<Metadata> {
  const { scholarSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }

  try {
    const scholar = await publicApi.getScholar(scholarSlug);
    return {
      title: scholar.name,
      description: scholar.bio ?? `Published library for ${scholar.name}.`,
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  } catch {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }
}

export async function ScholarDetailScreen({ params }: ScholarRouteProps) {
  const { scholarSlug } = await params;
  const { scholar, stats, collections, series, lectures, popular } =
    await loadScholarPage(scholarSlug);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator}>/</li>
          <li>
            <Link href="/scholars" className={styles.breadcrumbLink}>
              Scholars
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator}>/</li>
          <li className={styles.breadcrumbCurrent}>{scholar.name}</li>
        </ol>
      </nav>

      {/* Profile Header */}
      <ScholarProfileHeader scholar={scholar} stats={stats} />

      {/* Main Content with Sidebar */}
      <div className={styles.contentLayout}>
        <main className={styles.mainContent}>
          <ScholarDetailClient
            scholar={scholar}
            collections={collections}
            series={series}
            lectures={lectures}
          />
        </main>
        <aside className={styles.sidebar}>
          <ScholarSidebar scholar={scholar} popularItems={popular.items} />
        </aside>
      </div>
    </div>
  );
}
