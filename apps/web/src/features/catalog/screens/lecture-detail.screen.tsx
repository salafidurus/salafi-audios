import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogApi, CatalogApiError } from "@/features/catalog/api/catalog-public.api";
import { PrimaryAudioPanel } from "@/features/catalog/components/audio/primary-audio-panel";
import { CatalogShell } from "@/features/catalog/components/layout/catalog-shell";
import { DetailList, DetailRow } from "@/features/catalog/components/states/detail-list";
import styles from "./lecture-detail.screen.module.css";
import { formatDate, formatDuration } from "@/features/catalog/utils/catalog-format";
import { canonical } from "@/features/catalog/utils/catalog-seo";

type LectureRouteProps = {
  params: Promise<{ scholarSlug: string; lectureSlug: string }>;
};

async function loadLecturePage(scholarSlug: string, lectureSlug: string) {
  try {
    const [scholar, lecture] = await Promise.all([
      catalogApi.getScholar(scholarSlug),
      catalogApi.getScholarLecture(scholarSlug, lectureSlug),
    ]);

    return { scholar, lecture };
  } catch (error) {
    if (error instanceof CatalogApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function getLectureMetadata({ params }: LectureRouteProps): Promise<Metadata> {
  const { scholarSlug, lectureSlug } = await params;

  try {
    const lecture = await catalogApi.getScholarLecture(scholarSlug, lectureSlug);
    return {
      title: lecture.title,
      description: lecture.description ?? `Lecture by ${scholarSlug}.`,
      alternates: { canonical: canonical(`/lectures/${scholarSlug}/${lectureSlug}`) },
    };
  } catch {
    return {
      title: "Lecture",
      alternates: { canonical: canonical(`/lectures/${scholarSlug}/${lectureSlug}`) },
    };
  }
}

export async function LectureDetailScreen({ params }: LectureRouteProps) {
  const { scholarSlug, lectureSlug } = await params;
  const { scholar, lecture } = await loadLecturePage(scholarSlug, lectureSlug);

  return (
    <CatalogShell
      title={lecture.title}
      subtitle={lecture.description ?? undefined}
      breadcrumbs={[
        { href: `/scholars/${scholarSlug}`, label: scholar.name },
        { href: `/lectures/${scholarSlug}/${lectureSlug}`, label: lecture.title },
      ]}
    >
      <section className={styles["catalog-detail-panel"]}>
        <DetailList>
          <DetailRow label="Language" value={lecture.language} />
          <DetailRow label="Duration" value={formatDuration(lecture.durationSeconds)} />
          <DetailRow label="Published" value={formatDate(lecture.publishedAt)} />
          <DetailRow label="Slug" value={lecture.slug} />
        </DetailList>
      </section>
      {lecture.primaryAudioAsset?.url ? (
        <PrimaryAudioPanel url={lecture.primaryAudioAsset.url} />
      ) : null}
    </CatalogShell>
  );
}
