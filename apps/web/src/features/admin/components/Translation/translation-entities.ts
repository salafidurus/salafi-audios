import type { Locale, ListingFormat, TranslationViewDto } from "@sd/core-contracts";

import { fetchListingFormData, fetchArrangeData } from "@/features/admin/api/admin-lectures.api";
import {
  saveListingTranslation,
  publishListingTranslation,
  unpublishListingTranslation,
  saveScholarTranslation,
  publishScholarTranslation,
  unpublishScholarTranslation,
  saveTopicTranslation,
} from "@/features/admin/api/admin-translations.api";
import { fetchScholarFormData, fetchAdminTopic } from "@/features/admin/api/admin.api";

/**
 * The core-contracts `TranslationTarget` union identifies write targets by id only.
 * Topics are hydrated by slug (`fetchAdminTopic`) but written by id (`AdminTopicDetailDto.id`),
 * so the client-side target carries both.
 */
/** Client target identity, including the topic slug needed during hydration. */
export type ClientTranslationTarget =
  | { entity: "listing"; listingId: string }
  | { entity: "scholar"; scholarId: string }
  | {
      entity: "topic";
      topicId: string;
      /** Public topic identity used to load the editable topic record. */
      topicSlug: string;
    };

/** Field metadata used to render and validate one translatable value. */
export interface TranslationFieldConfig {
  key: string;
  labelKey: string;
  fallbackLabel: string;
  multiline?: boolean;
  required?: boolean;
}

/** Source entity and persisted translations loaded for an editor modal. */
export interface TranslationLoadResult {
  entityId: string;
  mainLocale: Locale;
  /** Read-only canonical values used as the translation reference. */
  source: Record<string, string | null>;
  translations: TranslationViewDto[];
  /** Listing format, if known — used only to decide whether a "sub-listings" tab is worth showing. */
  format?: ListingFormat;
}

/** One row in the flattened modules+lessons list shown on the listing "sub-listings" tab. */
export interface TranslationChildSummary {
  id: string;
  title: string;
  /** Child format used to render module versus lesson identity. */
  kind: "module" | "lesson";
  /** True for a lesson nested under a module — used to indent it in the list. */
  indent: boolean;
}

/**
 * Entity config map — this is the entire generalization mechanism for the
 * translation modal. No other per-entity abstraction should be added; new
 * translatable entities are onboarded by adding an entry here.
 */
export interface TranslationEntityConfig {
  fields: TranslationFieldConfig[];
  supportsPublish: boolean;
  load: (target: ClientTranslationTarget) => Promise<TranslationLoadResult>;
  save: (
    entityId: string,
    locale: Locale,
    fields: Record<string, string>,
  ) => Promise<TranslationViewDto>;
  publish?: (entityId: string, locale: Locale) => Promise<TranslationViewDto>;
  unpublish?: (entityId: string, locale: Locale) => Promise<TranslationViewDto>;
  /** True when this entity can have translatable children (listing modules/lessons). */
  supportsChildren?: boolean;
  /** Flattened modules+lessons for the "sub-listings" tab — only set when `supportsChildren`. */
  loadChildren?: (rootId: string) => Promise<TranslationChildSummary[]>;
}

const listingConfig: TranslationEntityConfig = {
  fields: [
    {
      key: "title",
      labelKey: "admin.translations.fields.title",
      fallbackLabel: "Title",
      required: true,
    },
    {
      key: "description",
      labelKey: "admin.translations.fields.description",
      fallbackLabel: "Description",
      multiline: true,
    },
  ],
  supportsPublish: true,
  async load(target) {
    if (target.entity !== "listing") throw new Error("Invalid target for listing translations");
    const data = await fetchListingFormData(target.listingId);
    return {
      entityId: data.listing.id,
      // SAFETY: listing form data exposes the same supported locale union consumed by the translation UI.
      mainLocale: (data.listing.language as Locale) ?? "ar",
      source: { title: data.listing.title, description: data.listing.description ?? null },
      translations: data.translations,
      format: data.listing.format,
    };
  },
  save(entityId, locale, fields) {
    return saveListingTranslation(entityId, {
      locale,
      title: fields.title ?? "",
      description: fields.description ?? null,
    });
  },
  publish(entityId, locale) {
    return publishListingTranslation(entityId, locale);
  },
  unpublish(entityId, locale) {
    return unpublishListingTranslation(entityId, locale);
  },
  supportsChildren: true,
  async loadChildren(rootId) {
    const data = await fetchArrangeData(rootId);
    const children: TranslationChildSummary[] = data.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      kind: "lesson" as const,
      indent: false,
    }));
    for (const mod of data.modules) {
      children.push({ id: mod.id, title: mod.title, kind: "module", indent: false });
      for (const lesson of mod.lessons) {
        children.push({ id: lesson.id, title: lesson.title, kind: "lesson", indent: true });
      }
    }
    return children;
  },
};

const scholarConfig: TranslationEntityConfig = {
  fields: [
    {
      key: "name",
      labelKey: "admin.translations.fields.name",
      fallbackLabel: "Name",
      required: true,
    },
    {
      key: "bio",
      labelKey: "admin.translations.fields.bio",
      fallbackLabel: "Bio",
      multiline: true,
    },
  ],
  supportsPublish: true,
  async load(target) {
    if (target.entity !== "scholar") throw new Error("Invalid target for scholar translations");
    const data = await fetchScholarFormData(target.scholarId);
    return {
      entityId: data.scholar.id,
      // SAFETY: scholar form data exposes the same supported locale union consumed by the translation UI.
      mainLocale: (data.scholar.mainLanguage as Locale) ?? "ar",
      source: { name: data.scholar.name, bio: data.scholar.bio ?? null },
      translations: data.translations,
    };
  },
  save(entityId, locale, fields) {
    return saveScholarTranslation(entityId, {
      locale,
      name: fields.name ?? "",
      bio: fields.bio ?? null,
    });
  },
  publish(entityId, locale) {
    return publishScholarTranslation(entityId, locale);
  },
  unpublish(entityId, locale) {
    return unpublishScholarTranslation(entityId, locale);
  },
};

const topicConfig: TranslationEntityConfig = {
  fields: [
    {
      key: "name",
      labelKey: "admin.translations.fields.name",
      fallbackLabel: "Name",
      required: true,
    },
  ],
  // TopicTranslation has no status column and no publish/unpublish endpoints (by design).
  supportsPublish: false,
  async load(target) {
    if (target.entity !== "topic") throw new Error("Invalid target for topic translations");
    const data = await fetchAdminTopic(target.topicSlug);
    return {
      entityId: data.id,
      mainLocale: "ar",
      source: { name: data.name.ar },
      translations: data.translations,
    };
  },
  save(entityId, locale, fields) {
    return saveTopicTranslation(entityId, { locale, name: fields.name ?? "" });
  },
};

/** Registry of loading and persistence behavior for each translatable entity. */
export const translationEntities = {
  listing: listingConfig,
  scholar: scholarConfig,
  topic: topicConfig,
} satisfies Record<ClientTranslationTarget["entity"], TranslationEntityConfig>;

/** Stable per-target identity for React `key`s — forces a remount (fresh load) per target. */
export function translationTargetKey(target: ClientTranslationTarget | null): string {
  if (!target) return "translation-closed";
  switch (target.entity) {
    case "listing":
      return `listing:${target.listingId}`;
    case "scholar":
      return `scholar:${target.scholarId}`;
    case "topic":
      return `topic:${target.topicId}`;
  }
}
