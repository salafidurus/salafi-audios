import { pickContentField } from "@sd/core-i18n";
import { useAudio } from "@sd/domain-audio";
import { useListingContents, useListingDetail } from "@sd/domain-content";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useEffect } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { ContainerLectureView } from "./container-lecture-view";
import { SingleLectureView } from "./single-lecture-view";

export type LectureDetailScreenProps = {
  slug: string;
};

export function LectureDetailScreen({ slug }: LectureDetailScreenProps) {
  const { anchor } = useLocalSearchParams<{ slug: string; anchor?: string }>();
  const { theme } = useUnistyles();
  const { data: lecture, isFetching } = useListingDetail(slug);
  const { data: seriesContents } = useListingContents(lecture?.seriesContext?.seriesSlug ?? "");
  const isContainer = lecture?.format === "series" || lecture?.format === "collection";
  const { data: ownContents } = useListingContents(isContainer ? lecture!.slug : "");
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const { isPlaying, currentTrack } = useAudio();
  const isCurrentTrack = lecture ? currentTrack?.id === lecture.id : false;

  // Slugs are flat and don't encode nesting, so a Lesson/Module's own slug
  // resolves to itself — redirect to the top-level page it belongs under,
  // anchored to this item so the parent page can scroll to and highlight it.
  useEffect(() => {
    if (lecture?.rootListing) {
      router.replace(`/listings/${lecture.rootListing.slug}?anchor=${lecture.id}`);
    }
  }, [lecture]);

  if (isFetching) {
    return (
      <ScreenView center>
        <EmptyState message={t("lecture.loading", "Loading lecture…")} variant="loading" />
      </ScreenView>
    );
  }

  if (!lecture) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("lecture.notFound", "Lecture not found")}
          variant="error"
          description={t(
            "lecture.notFoundDesc",
            "This lecture may have been removed or is no longer available.",
          )}
          icon={<AlertCircle size={24} color={theme.colors.state.dangerContent} />}
        />
      </ScreenView>
    );
  }

  if (lecture.rootListing) {
    return (
      <ScreenView center>
        <EmptyState message={t("lecture.loading", "Loading lecture…")} variant="loading" />
      </ScreenView>
    );
  }

  const title = pickContentField(lecture.title, lecture.original?.title, showOriginal);
  const description = lecture.description
    ? pickContentField(lecture.description, lecture.original?.description, showOriginal)
    : undefined;

  if (isContainer) {
    return (
      <ContainerLectureView
        lecture={lecture}
        title={title}
        ownContents={ownContents}
        anchor={anchor}
      />
    );
  }

  return (
    <SingleLectureView
      lecture={lecture}
      title={title}
      description={description}
      isPlaying={isPlaying}
      isCurrentTrack={isCurrentTrack}
      seriesContents={seriesContents}
    />
  );
}
