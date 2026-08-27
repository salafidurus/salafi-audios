"use client";

import type { Locale, TopicDetailDto } from "@sd/core-contracts";

import { getLocalizedName } from "@sd/core-i18n";

import type { FormState } from "@/features/admin/hooks/Content/useListingForm";

import { useTranslation } from "@/core/i18n/use-translation";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";

interface ListingReviewSectionProps {
  state: FormState;
  mainLocale: Locale;
  topics: TopicDetailDto[];
}

function sameTopics(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = a.toSorted();
  const sortedB = b.toSorted();
  return sortedA.every((id, i) => id === sortedB[i]);
}

type ReviewChanges = {
  titleChanged: boolean;
  descriptionChanged: boolean;
  statusChanged: boolean;
  orderIndexChanged: boolean;
  languageChanged: boolean;
  coverImageChanged: boolean;
  topicsChanged: boolean;
};

function getReviewChanges(state: FormState): ReviewChanges {
  const { title, description, status, orderIndex, selectedTopics, language, coverImageUrl } = state;
  const initial = state.initialSnapshot;
  return initial
    ? getEditReviewChanges(
        initial,
        title,
        description,
        status,
        orderIndex,
        selectedTopics,
        language,
        coverImageUrl,
      )
    : getCreateReviewChanges(title, language, coverImageUrl, selectedTopics);
}

function getCreateReviewChanges(
  title: string,
  language: Locale,
  coverImageUrl: string | null,
  selectedTopics: string[],
): ReviewChanges {
  return {
    titleChanged: Boolean(title),
    descriptionChanged: false,
    statusChanged: false,
    orderIndexChanged: false,
    languageChanged: Boolean(language),
    coverImageChanged: Boolean(coverImageUrl),
    topicsChanged: selectedTopics.length > 0,
  };
}

function getEditReviewChanges(
  initial: NonNullable<FormState["initialSnapshot"]>,
  title: string,
  description: string,
  status: string,
  orderIndex: number | null,
  selectedTopics: string[],
  language: Locale,
  coverImageUrl: string | null,
): ReviewChanges {
  return {
    titleChanged: title !== initial.title,
    descriptionChanged: description !== initial.description,
    statusChanged: status !== initial.status,
    orderIndexChanged: orderIndex !== initial.orderIndex,
    languageChanged: language !== initial.language,
    coverImageChanged: coverImageUrl !== initial.coverImageUrl,
    topicsChanged: !sameTopics(selectedTopics, initial.selectedTopics),
  };
}

type MainChangesProps = {
  title: string;
  description: string;
  mainLocale: Locale;
  t: ReturnType<typeof useTranslation>["t"];
  changes: Pick<ReviewChanges, "titleChanged" | "descriptionChanged">;
};

function MainChanges({ title, description, mainLocale, t, changes }: MainChangesProps) {
  const { titleChanged, descriptionChanged } = changes;
  if (!titleChanged && !descriptionChanged) return null;
  return (
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
  );
}

type DetailChangesProps = {
  status: string;
  orderIndex: number | null;
  language: Locale;
  topicNames: string[];
  t: ReturnType<typeof useTranslation>["t"];
  changes: Pick<
    ReviewChanges,
    | "statusChanged"
    | "orderIndexChanged"
    | "languageChanged"
    | "coverImageChanged"
    | "topicsChanged"
  >;
};

function TopicChange({
  topicNames,
  t,
}: {
  topicNames: string[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <p>
      <strong>{t("admin.contents.listing.topicsLabel", "Topics")}:</strong>{" "}
      {topicNames.length > 0
        ? topicNames.join(", ")
        : t("admin.contents.listing.noTopicsAvailable", "No topics available")}
    </p>
  );
}

function StatusChange({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <p>
      <strong>{t("admin.contents.listing.statusLabel", "Status")}:</strong> {status}
    </p>
  );
}

function hasDetailChanges(changes: DetailChangesProps["changes"]): boolean {
  return Object.values(changes).some(Boolean);
}

function DetailChanges({
  status,
  orderIndex,
  language,
  topicNames,
  t,
  changes,
}: DetailChangesProps) {
  const { statusChanged, orderIndexChanged, languageChanged, coverImageChanged, topicsChanged } =
    changes;
  if (!hasDetailChanges(changes)) return null;
  return (
    <div>
      <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
        {t("admin.modal.generalTab", "General")}
      </h4>
      {statusChanged && <StatusChange status={status} t={t} />}
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
      {topicsChanged && <TopicChange topicNames={topicNames} t={t} />}
    </div>
  );
}

export function ListingReviewSection({ state, mainLocale, topics }: ListingReviewSectionProps) {
  const { t, i18n } = useTranslation();
  const { title, description, status, orderIndex, selectedTopics, language } = state;

  // description, status, and orderIndex are not part of the create payload
  // (a listing is created bare and only gains these via a later edit), so
  // showing them as pending changes on create would be misleading. language,
  // topics, and coverImage ARE part of the create payload, so those are
  // shown whenever they've been set, mirroring how the title is handled.
  const changes = getReviewChanges(state);
  const {
    titleChanged,
    descriptionChanged,
    statusChanged,
    orderIndexChanged,
    languageChanged,
    coverImageChanged,
    topicsChanged,
  } = changes;

  const hasMainChanges = titleChanged || descriptionChanged;
  const hasDetailChanges =
    statusChanged || orderIndexChanged || languageChanged || coverImageChanged || topicsChanged;
  const hasAnyChanges = hasMainChanges || hasDetailChanges;

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
      <MainChanges
        title={title}
        description={description}
        mainLocale={mainLocale}
        t={t}
        changes={changes}
      />
      <DetailChanges
        t={t}
        language={language}
        status={status}
        orderIndex={orderIndex}
        topicNames={topicNames}
        changes={changes}
      />
    </div>
  );
}
