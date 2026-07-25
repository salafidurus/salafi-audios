"use client";

import type { Locale, TopicDetailDto } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormState } from "@/features/admin/hooks/Content/useListingForm";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";

interface ListingReviewSectionProps {
  state: FormState;
  mainLocale: Locale;
  otherLocale: Locale;
  topics: TopicDetailDto[];
}

function sameTopics(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = a.toSorted();
  const sortedB = b.toSorted();
  return sortedA.every((id, i) => id === sortedB[i]);
}

export function ListingReviewSection({
  state,
  mainLocale,
  otherLocale,
  topics,
}: ListingReviewSectionProps) {
  const { t, i18n } = useTranslation();
  const { title, description, status, orderIndex, selectedTopics, language, coverImageUrl } = state;
  const initial = state.initialSnapshot;

  // description, status, and orderIndex are not part of the create payload
  // (a listing is created bare and only gains these via a later edit), so
  // showing them as pending changes on create would be misleading. language,
  // topics, and coverImage ARE part of the create payload, so those are
  // shown whenever they've been set, mirroring how the title is handled.
  const titleChanged = initial ? title !== initial.title : !!title;
  const descriptionChanged = initial ? description !== initial.description : false;
  const statusChanged = initial ? status !== initial.status : false;
  const orderIndexChanged = initial ? orderIndex !== initial.orderIndex : false;
  const languageChanged = initial ? language !== initial.language : !!language;
  const coverImageChanged = initial ? coverImageUrl !== initial.coverImageUrl : !!coverImageUrl;
  const topicsChanged = initial
    ? !sameTopics(selectedTopics, initial.selectedTopics)
    : selectedTopics.length > 0;

  const otherTranslation = state.translationChanges[otherLocale];
  const otherTranslationInitial = state.initialTranslationChanges?.[otherLocale];
  const otherTranslationChanged =
    otherTranslation?.title !== otherTranslationInitial?.title ||
    otherTranslation?.description !== otherTranslationInitial?.description;

  const hasMainChanges = titleChanged || descriptionChanged;
  const hasDetailChanges =
    statusChanged || orderIndexChanged || languageChanged || coverImageChanged || topicsChanged;
  const hasAnyChanges = hasMainChanges || hasDetailChanges || otherTranslationChanged;

  if (!hasAnyChanges) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--content-tertiary)",
        }}
      >
        {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
      </div>
    );
  }

  const topicNames = selectedTopics
    .map((id) => topics.find((topic) => topic.id === id))
    .filter((topic): topic is TopicDetailDto => !!topic)
    .map((topic) => getLocalizedName(topic.name, i18n.language));

  return (
    <div style={{ padding: "2rem" }}>
      {hasMainChanges && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {getLocaleLabel(mainLocale)}
          </h4>
          {titleChanged && (
            <p>
              <strong>{t("admin.contents.listing.titleLabel", "Title")}:</strong> {title}
            </p>
          )}
          {descriptionChanged && (
            <p>
              <strong>{t("admin.contents.listing.descriptionLabel", "Description")}:</strong>{" "}
              {description}
            </p>
          )}
        </div>
      )}

      {otherTranslationChanged && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {getLocaleLabel(otherLocale)}
          </h4>
          {otherTranslation?.title !== otherTranslationInitial?.title && (
            <p>
              <strong>{t("admin.contents.listing.titleLabel", "Title")}:</strong>{" "}
              {otherTranslation?.title}
            </p>
          )}
          {otherTranslation?.description !== otherTranslationInitial?.description && (
            <p>
              <strong>{t("admin.contents.listing.descriptionLabel", "Description")}:</strong>{" "}
              {otherTranslation?.description}
            </p>
          )}
        </div>
      )}

      {hasDetailChanges && (
        <div>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {t("admin.modal.generalTab", "General")}
          </h4>
          {statusChanged && (
            <p>
              <strong>{t("admin.contents.listing.statusLabel", "Status")}:</strong> {status}
            </p>
          )}
          {orderIndexChanged && (
            <p>
              <strong>{t("admin.contents.listing.orderIndexLabel", "Order Index")}:</strong>{" "}
              {orderIndex}
            </p>
          )}
          {languageChanged && (
            <p>
              <strong>{t("admin.contents.listing.languageLabel", "Language")}:</strong>{" "}
              {getLocaleLabel(language)}
            </p>
          )}
          {coverImageChanged && (
            <p>
              <strong>{t("admin.contents.listing.coverImageLabel", "Cover Image")}:</strong>{" "}
              {t("admin.contents.listing.coverImageUpdated", "Updated")}
            </p>
          )}
          {topicsChanged && (
            <p>
              <strong>{t("admin.contents.listing.topicsLabel", "Topics")}:</strong>{" "}
              {topicNames.length > 0
                ? topicNames.join(", ")
                : t("admin.contents.listing.noTopicsAvailable", "No topics available")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
