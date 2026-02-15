import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi, PublicApiError } from "@/features/home/api/public-api";
import { tryGetWebEnv } from "@/shared/utils/env";
import { PrimaryAudioPanel } from "@/features/library/components/audio/primary-audio-panel/primary-audio-panel";
import { Shell } from "@/features/library/components/layout/shell/shell";
import {
  DetailList,
  DetailRow,
} from "@/features/library/components/states/detail-list/detail-list";
import styles from "./screen.module.css";
import { formatDate, formatDuration } from "@/features/library/utils/format";
import { canonical } from "@/features/library/utils/seo";

type LectureRouteProps = {
  params: Promise<{ scholarSlug: string; lectureSlug: string }>;
};

async function loadLecturePage(scholarSlug: string, lectureSlug: string) {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, lecture] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.getScholarLecture(scholarSlug, lectureSlug),
    ]);

    return { scholar, lecture };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    notFound();
  }
}

export async function getLectureMetadata({ params }: LectureRouteProps): Promise<Metadata> {
  const { scholarSlug, lectureSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Lecture",
      alternates: { canonical: canonical(`/lectures/${scholarSlug}/${lectureSlug}`) },
    };
  }

  try {
    const lecture = await publicApi.getScholarLecture(scholarSlug, lectureSlug);
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
    <Shell
      title={lecture.title}
      subtitle={lecture.description ?? undefined}
      breadcrumbs={[
        { href: `/scholars/${scholarSlug}`, label: scholar.name },
        { href: `/lectures/${scholarSlug}/${lectureSlug}`, label: lecture.title },
      ]}
    >
      <section className={styles.detailPanel}>
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
    </Shell>
  );
}
