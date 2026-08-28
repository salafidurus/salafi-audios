"use client";

import type {
  AdminArrangeDataDto,
  AdminArrangeLessonDto,
  ArrangeCommitDto,
  ArrangeLessonOp,
  ArrangeModuleOp,
  BatchPresignAudioRequestDto,
  StatusValue,
} from "@sd/core-contracts";

import { useReducer } from "react";

import {
  deriveChildSlug,
  findSlugMatch,
  parseUploadFilename,
} from "@/features/admin/utils/upload-filename";

/** Existing module id, `new:${tempId}` for a staged module, or "root" (series/single). */
export type ModuleKey = string;

export const ROOT_MODULE_KEY = "root";

export type UploadItemAssignment =
  | {
      kind: "new-lesson";
      moduleKey: ModuleKey;
      slug: string;
      slugEdited: boolean;
      description: string;
      status: StatusValue;
      orderIndex: number | null;
    }
  | { kind: "replace-audio"; lessonId: string }
  | { kind: "replace-root-audio" };

export interface UploadItemProgress {
  status: "pending" | "downloading" | "uploading" | "done" | "error";
  percent: number;
  loadedBytes?: number;
  totalBytes?: number;
  objectKey?: string;
  uploadUrl?: string;
  error?: string;
}

/** Where an item's bytes come from: already-picked local File, or a URL fetched at upload time. */
export type UploadItemSource = { kind: "local"; file: File } | { kind: "url"; url: string };

export interface UploadItem {
  id: string;
  source: UploadItemSource;
  filename: string;
  title: string;
  numericPrefix: number | null;
  durationSeconds: number | null;
  sizeBytes: number;
  contentType: string;
  ext: string;
  assignment: UploadItemAssignment;
  suggestion: { lessonId: string; lessonTitle: string; dismissed: boolean } | null;
  upload: UploadItemProgress;
}

export interface NewModule {
  tempId: string;
  slug: string;
  slugEdited: boolean;
  title: string;
  description: string;
  status: StatusValue;
  orderIndex: number | null;
}

export type UploadArrangePhase = "editing" | "presigning" | "uploading" | "committing" | "done";

export interface UploadArrangeState {
  existing: AdminArrangeDataDto | null;
  items: UploadItem[];
  newModules: NewModule[];
  phase: UploadArrangePhase;
  error: string | null;
  conflictSlugs: string[];
}

export type UploadArrangeAction =
  | { type: "INIT_EXISTING"; data: AdminArrangeDataDto }
  | { type: "ADD_FILES"; files: { file: File; durationSeconds: number | null }[] }
  | {
      type: "ADD_URL_ITEMS";
      items: {
        url: string;
        filename: string;
        contentType: string;
        sizeBytes: number;
        durationSeconds: number | null;
      }[];
    }
  | { type: "RENAME_ITEM"; itemId: string; title: string }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "SET_ASSIGNMENT"; itemId: string; assignment: UploadItemAssignment }
  | {
      type: "SET_LESSON_FIELD";
      itemId: string;
      field: "slug" | "description" | "status" | "orderIndex";
      value: string | number | null;
    }
  | { type: "ACCEPT_SUGGESTION"; itemId: string }
  | { type: "DISMISS_SUGGESTION"; itemId: string }
  | { type: "ADD_MODULE"; title: string }
  | {
      type: "EDIT_MODULE";
      tempId: string;
      field: "title" | "slug" | "description" | "status" | "orderIndex";
      value: string | number | null;
    }
  | { type: "REMOVE_MODULE"; tempId: string }
  | { type: "REORDER"; moduleKey: ModuleKey; orderedItemIds: string[] }
  | { type: "SET_PHASE"; phase: UploadArrangePhase }
  | { type: "PRESIGNED"; urls: { clientId: string; uploadUrl: string; objectKey: string }[] }
  | {
      type: "UPLOAD_PROGRESS";
      itemId: string;
      status: "downloading" | "uploading";
      percent: number;
      loadedBytes?: number;
      totalBytes?: number;
    }
  | { type: "UPLOAD_DONE"; itemId: string }
  | { type: "UPLOAD_ERROR"; itemId: string; error: string }
  | { type: "COMMIT_CONFLICT"; conflictSlugs: string[] }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_ALL_LESSON_STATUS"; status: StatusValue };

const INITIAL_STATE: UploadArrangeState = {
  existing: null,
  items: [],
  newModules: [],
  phase: "editing",
  error: null,
  conflictSlugs: [],
};

function allExistingLessons(existing: AdminArrangeDataDto | null): AdminArrangeLessonDto[] {
  if (!existing) return [];
  return [...existing.lessons, ...existing.modules.flatMap((m) => m.lessons)];
}

function nextOrderIndex(state: UploadArrangeState, moduleKey: ModuleKey): number {
  const staged = state.items.filter(
    (item) => item.assignment.kind === "new-lesson" && item.assignment.moduleKey === moduleKey,
  );
  const stagedMax = staged.reduce((max, item) => {
    const idx = item.assignment.kind === "new-lesson" ? (item.assignment.orderIndex ?? 0) : 0;
    return Math.max(max, idx);
  }, 0);
  const existingLessons =
    moduleKey === ROOT_MODULE_KEY
      ? (state.existing?.lessons ?? [])
      : (state.existing?.modules.find((m) => m.id === moduleKey)?.lessons ?? []);
  const existingMax = existingLessons.reduce((max, l) => Math.max(max, l.orderIndex ?? 0), 0);
  return Math.max(stagedMax, existingMax) + 1;
}

/** The slug an item/module must be prefixed by, given its immediate parent container. */
function existingRootSlug(state: UploadArrangeState): string {
  return state.existing?.slug ?? "";
}

function newModuleParentSlug(state: UploadArrangeState, moduleKey: ModuleKey): string {
  const tempId = moduleKey.slice("new:".length);
  return (
    state.newModules.find((module) => module.tempId === tempId)?.slug ?? existingRootSlug(state)
  );
}

function existingModuleParentSlug(state: UploadArrangeState, moduleKey: ModuleKey): string {
  return (
    state.existing?.modules.find((module) => module.id === moduleKey)?.slug ??
    existingRootSlug(state)
  );
}

export function resolveParentSlug(state: UploadArrangeState, moduleKey: ModuleKey): string {
  if (moduleKey === ROOT_MODULE_KEY) return existingRootSlug(state);
  if (moduleKey.startsWith("new:")) return newModuleParentSlug(state, moduleKey);
  return existingModuleParentSlug(state, moduleKey);
}

function updateItem(
  state: UploadArrangeState,
  itemId: string,
  update: (item: UploadItem) => UploadItem,
): UploadArrangeState {
  return {
    ...state,
    items: state.items.map((item) => (item.id === itemId ? update(item) : item)),
  };
}

/**
 * Within each moduleKey group, sort new-lesson items ascending by orderIndex.
 * Items with null orderIndex float to the bottom of their group.
 * Group order (relative position of groups to each other) is preserved.
 * replace-audio / replace-root-audio items retain their positions.
 */
function sortItemsByOrderIndex(items: UploadItem[]): UploadItem[] {
  // Extract groups while preserving group insertion order.
  const groupOrder: ModuleKey[] = [];
  const groups = new Map<ModuleKey, UploadItem[]>();
  for (const item of items) {
    const key = item.assignment.kind === "new-lesson" ? item.assignment.moduleKey : "__other__";
    if (!groups.has(key)) {
      groups.set(key, []);
      groupOrder.push(key);
    }
    groups.get(key)!.push(item);
  }

  // Sort new-lesson items within each group; leave __other__ items as-is.
  for (const [key, groupItems] of groups) {
    if (key === "__other__") continue;
    groupItems.sort((a, b) => {
      const aIdx = a.assignment.kind === "new-lesson" ? a.assignment.orderIndex : null;
      const bIdx = b.assignment.kind === "new-lesson" ? b.assignment.orderIndex : null;
      if (aIdx === null && bIdx === null) return 0;
      if (aIdx === null) return 1;
      if (bIdx === null) return -1;
      return aIdx - bIdx;
    });
  }

  return groupOrder.flatMap((key) => groups.get(key)!);
}

interface StagedItemInput {
  source: UploadItemSource;
  filename: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds: number | null;
}

/** Shared by ADD_FILES and ADD_URL_ITEMS — identical sorting/slug-derivation/order-cursor
 *  logic, differing only in where each item's bytes come from. */
function buildStagedItems(state: UploadArrangeState, inputs: StagedItemInput[]): UploadItem[] {
  if (!state.existing) return [];
  const { existing } = state;
  const isSingle = existing.format === "single";
  const lessons = allExistingLessons(existing);

  const sorted = inputs.toSorted((a, b) => {
    const pa = parseUploadFilename(a.filename).numericPrefix;
    const pb = parseUploadFilename(b.filename).numericPrefix;
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return pa - pb;
  });

  let orderCursor = nextOrderIndex(state, ROOT_MODULE_KEY);
  return sorted.map((input) => {
    const parsed = parseUploadFilename(input.filename);
    const slug = deriveChildSlug(existing.slug, parsed.title);
    const match = findSlugMatch(slug, lessons);

    const assignment: UploadItemAssignment = isSingle
      ? { kind: "replace-root-audio" }
      : {
          kind: "new-lesson",
          moduleKey: ROOT_MODULE_KEY,
          slug,
          slugEdited: false,
          description: "",
          status: "draft",
          orderIndex: parsed.numericPrefix ?? orderCursor++,
        };

    return {
      id: crypto.randomUUID(),
      source: input.source,
      filename: input.filename,
      title: parsed.title,
      numericPrefix: parsed.numericPrefix,
      durationSeconds: input.durationSeconds,
      sizeBytes: input.sizeBytes,
      contentType: input.contentType,
      ext: parsed.ext,
      assignment,
      suggestion: match ? { lessonId: match.id, lessonTitle: match.title, dismissed: false } : null,
      upload: { status: "pending", percent: 0 } satisfies UploadItemProgress,
    };
  });
}

type EditModuleAction = Extract<UploadArrangeAction, { type: "EDIT_MODULE" }>;

function editModuleTitle(mod: NewModule, action: EditModuleAction, rootSlug: string): NewModule {
  const title = String(action.value ?? "");
  return mod.slugEdited
    ? { ...mod, title }
    : { ...mod, title, slug: deriveChildSlug(rootSlug, title) };
}

function editModuleOrder(mod: NewModule, action: EditModuleAction): NewModule {
  const orderIndex = action.value === null ? null : Number(action.value);
  return { ...mod, orderIndex };
}

function editModule(mod: NewModule, action: EditModuleAction, rootSlug: string): NewModule {
  if (action.field === "slug") {
    return { ...mod, slug: String(action.value ?? ""), slugEdited: true };
  }
  if (action.field === "title") {
    return editModuleTitle(mod, action, rootSlug);
  }
  if (action.field === "orderIndex") return editModuleOrder(mod, action);
  return { ...mod, [action.field]: action.value };
}

type SetLessonFieldAction = Extract<UploadArrangeAction, { type: "SET_LESSON_FIELD" }>;

function normalizeOrderIndex(value: SetLessonFieldAction["value"]): number | null {
  return value === null ? null : Number(value);
}

function updateLessonField(item: UploadItem, action: SetLessonFieldAction): UploadItem {
  if (item.assignment.kind !== "new-lesson") return item;
  const assignment = { ...item.assignment };
  if (action.field === "slug") {
    assignment.slug = String(action.value ?? "");
    assignment.slugEdited = true;
  } else if (action.field === "description") {
    assignment.description = String(action.value ?? "");
  } else if (action.field === "status") {
    // SAFETY: the status editor dispatches only domain `StatusValue` options for the
    // `"status"` field branch of this reducer action.
    assignment.status = action.value as StatusValue;
  } else {
    assignment.orderIndex = normalizeOrderIndex(action.value);
  }
  return { ...item, assignment };
}

function appendStagedItems(
  state: UploadArrangeState,
  inputs: StagedItemInput[],
): UploadArrangeState {
  if (!state.existing) return state;
  if (state.existing.format === "single" && (state.items.length > 0 || inputs.length > 1)) {
    return { ...state, error: "This listing holds a single audio file." };
  }
  const newItems = buildStagedItems(state, inputs);
  return { ...state, items: [...state.items, ...newItems], error: null };
}

function addFiles(
  state: UploadArrangeState,
  action: Extract<UploadArrangeAction, { type: "ADD_FILES" }>,
): UploadArrangeState {
  return appendStagedItems(
    state,
    action.files.map(({ file, durationSeconds }) => ({
      source: { kind: "local", file },
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      durationSeconds,
    })),
  );
}

function addUrlItems(
  state: UploadArrangeState,
  action: Extract<UploadArrangeAction, { type: "ADD_URL_ITEMS" }>,
): UploadArrangeState {
  return appendStagedItems(
    state,
    action.items.map((entry) => ({
      source: { kind: "url", url: entry.url },
      filename: entry.filename,
      contentType: entry.contentType,
      sizeBytes: entry.sizeBytes,
      durationSeconds: entry.durationSeconds,
    })),
  );
}

function reducer(state: UploadArrangeState, action: UploadArrangeAction): UploadArrangeState {
  switch (action.type) {
    case "INIT_EXISTING":
      // The modal is keyed by listingId (see ListingsContent.tsx), so this reducer is
      // always freshly mounted at INITIAL_STATE before this action fires — no need to
      // spread INITIAL_STATE here too.
      return { ...state, existing: action.data };

    case "ADD_FILES":
      return addFiles(state, action);

    case "ADD_URL_ITEMS":
      return addUrlItems(state, action);

    case "RENAME_ITEM":
      return updateItem(state, action.itemId, (item) => {
        const next = { ...item, title: action.title };
        if (item.assignment.kind === "new-lesson" && !item.assignment.slugEdited) {
          const parentSlug = resolveParentSlug(state, item.assignment.moduleKey);
          const slug = deriveChildSlug(parentSlug, action.title);
          const match = findSlugMatch(slug, allExistingLessons(state.existing));
          next.assignment = { ...item.assignment, slug };
          next.suggestion = match
            ? { lessonId: match.id, lessonTitle: match.title, dismissed: false }
            : null;
        }
        return next;
      });

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.itemId) };

    case "SET_ASSIGNMENT":
      return updateItem(state, action.itemId, (item) => {
        const incoming = action.assignment;
        if (
          incoming.kind === "new-lesson" &&
          item.assignment.kind === "new-lesson" &&
          incoming.moduleKey !== item.assignment.moduleKey &&
          !incoming.slugEdited
        ) {
          const parentSlug = resolveParentSlug(state, incoming.moduleKey);
          return {
            ...item,
            assignment: { ...incoming, slug: deriveChildSlug(parentSlug, item.title) },
          };
        }
        return { ...item, assignment: incoming };
      });

    case "SET_LESSON_FIELD": {
      const updated = updateItem(state, action.itemId, (item) => updateLessonField(item, action));
      // Re-sort within each module group when the orderIndex field changes.
      if (action.field === "orderIndex") {
        return { ...updated, items: sortItemsByOrderIndex(updated.items) };
      }
      return updated;
    }

    case "SET_ALL_LESSON_STATUS":
      return {
        ...state,
        items: state.items.map((item) =>
          item.assignment.kind === "new-lesson"
            ? { ...item, assignment: { ...item.assignment, status: action.status } }
            : item,
        ),
      };

    case "ACCEPT_SUGGESTION":
      return updateItem(state, action.itemId, (item) =>
        item.suggestion
          ? {
              ...item,
              assignment: { kind: "replace-audio", lessonId: item.suggestion.lessonId },
              suggestion: { ...item.suggestion, dismissed: true },
            }
          : item,
      );

    case "DISMISS_SUGGESTION":
      return updateItem(state, action.itemId, (item) =>
        item.suggestion ? { ...item, suggestion: { ...item.suggestion, dismissed: true } } : item,
      );

    case "ADD_MODULE": {
      if (!state.existing) return state;
      const slug = deriveChildSlug(state.existing.slug, action.title);
      const orderIndex =
        state.existing.modules.reduce((max, m) => Math.max(max, m.orderIndex ?? 0), 0) +
        state.newModules.length +
        1;
      return {
        ...state,
        newModules: [
          ...state.newModules,
          {
            tempId: crypto.randomUUID(),
            slug,
            slugEdited: false,
            title: action.title,
            description: "",
            status: "draft",
            orderIndex,
          },
        ],
      };
    }

    case "EDIT_MODULE": {
      const newModules = state.newModules.map((mod) =>
        mod.tempId === action.tempId ? editModule(mod, action, state.existing?.slug ?? "") : mod,
      );

      const editedModule = newModules.find((m) => m.tempId === action.tempId);
      const moduleKey = `new:${action.tempId}`;
      const items =
        editedModule && (action.field === "slug" || action.field === "title")
          ? state.items.map((item) =>
              item.assignment.kind === "new-lesson" &&
              item.assignment.moduleKey === moduleKey &&
              !item.assignment.slugEdited
                ? {
                    ...item,
                    assignment: {
                      ...item.assignment,
                      slug: deriveChildSlug(editedModule.slug, item.title),
                    },
                  }
                : item,
            )
          : state.items;

      return { ...state, newModules, items };
    }

    case "REMOVE_MODULE": {
      const moduleKey = `new:${action.tempId}`;
      const rootSlug = resolveParentSlug(state, ROOT_MODULE_KEY);
      return {
        ...state,
        newModules: state.newModules.filter((mod) => mod.tempId !== action.tempId),
        // Reassign orphaned items back to root so they stay visible, re-deriving
        // their slug against the root (unless manually edited) since they no
        // longer sit under the removed module's prefix.
        items: state.items.map((item) =>
          item.assignment.kind === "new-lesson" && item.assignment.moduleKey === moduleKey
            ? {
                ...item,
                assignment: {
                  ...item.assignment,
                  moduleKey: ROOT_MODULE_KEY,
                  slug: item.assignment.slugEdited
                    ? item.assignment.slug
                    : deriveChildSlug(rootSlug, item.title),
                },
              }
            : item,
        ),
      };
    }

    case "REORDER": {
      const order = new Map(action.orderedItemIds.map((id, index) => [id, index + 1]));
      return {
        ...state,
        items: state.items.map((item) =>
          item.assignment.kind === "new-lesson" &&
          item.assignment.moduleKey === action.moduleKey &&
          order.has(item.id)
            ? {
                ...item,
                assignment: { ...item.assignment, orderIndex: order.get(item.id) ?? null },
              }
            : item,
        ),
      };
    }

    case "SET_PHASE":
      return { ...state, phase: action.phase, error: null };

    case "PRESIGNED": {
      const byId = new Map(action.urls.map((u) => [u.clientId, u]));
      return {
        ...state,
        items: state.items.map((item) => {
          const presigned = byId.get(item.id);
          return presigned
            ? {
                ...item,
                upload: {
                  ...item.upload,
                  uploadUrl: presigned.uploadUrl,
                  objectKey: presigned.objectKey,
                },
              }
            : item;
        }),
      };
    }

    case "UPLOAD_PROGRESS":
      return updateItem(state, action.itemId, (item) => ({
        ...item,
        upload: {
          ...item.upload,
          status: action.status,
          percent: action.percent,
          loadedBytes: action.loadedBytes,
          totalBytes: action.totalBytes,
        },
      }));

    case "UPLOAD_DONE":
      return updateItem(state, action.itemId, (item) => ({
        ...item,
        upload: { ...item.upload, status: "done", percent: 100 },
      }));

    case "UPLOAD_ERROR":
      return updateItem(state, action.itemId, (item) => ({
        ...item,
        upload: { ...item.upload, status: "error", error: action.error },
      }));

    case "COMMIT_CONFLICT":
      return { ...state, phase: "editing", conflictSlugs: action.conflictSlugs };

    case "SET_ERROR":
      return { ...state, error: action.error, phase: "editing" };

    default:
      return state;
  }
}

function itemAudioRef(item: UploadItem) {
  return {
    objectKey: item.upload.objectKey ?? "",
    durationSeconds: Math.round(item.durationSeconds ?? 0),
    sizeBytes: item.sizeBytes,
    format: item.ext || undefined,
  };
}

export function buildPresignRequest(state: UploadArrangeState): BatchPresignAudioRequestDto {
  const rootSlug = state.existing?.slug ?? "";
  return {
    rootSlug,
    files: state.items.map((item) => ({
      clientId: item.id,
      filename: item.filename,
      contentType: item.contentType,
      slug: itemTargetSlug(state, item),
    })),
  };
}

/** The storage slug for an item: its new-lesson slug, the replaced lesson's slug, or the root slug. */
export function itemTargetSlug(state: UploadArrangeState, item: UploadItem): string {
  if (item.assignment.kind === "new-lesson") return item.assignment.slug;
  if (item.assignment.kind === "replace-audio") {
    const lesson = allExistingLessons(state.existing).find(
      (l) => item.assignment.kind === "replace-audio" && l.id === item.assignment.lessonId,
    );
    return lesson?.slug ?? "";
  }
  return state.existing?.slug ?? "";
}

function createLessonOp(
  item: UploadItem,
  assignment: Extract<UploadItem["assignment"], { kind: "new-lesson" }>,
): ArrangeLessonOp {
  return {
    op: "create",
    slug: assignment.slug,
    title: item.title,
    description: assignment.description || undefined,
    status: assignment.status,
    orderIndex: assignment.orderIndex ?? undefined,
    audio: itemAudioRef(item),
  };
}

function getReplaceLessonOp(
  item: UploadItem,
  assignment: Extract<UploadItem["assignment"], { kind: "replace-audio" }>,
  existing: NonNullable<UploadArrangeState["existing"]>,
  moduleKey: ModuleKey,
): ArrangeLessonOp | null {
  const parentKey =
    existing.modules.find((m) => m.lessons.some((l) => l.id === assignment.lessonId))?.id ??
    ROOT_MODULE_KEY;
  return parentKey === moduleKey
    ? { op: "update", id: assignment.lessonId, audio: itemAudioRef(item) }
    : null;
}

function buildLessonOps(
  state: UploadArrangeState,
  existing: NonNullable<UploadArrangeState["existing"]>,
  moduleKey: ModuleKey,
): ArrangeLessonOp[] {
  const ops: ArrangeLessonOp[] = [];
  for (const item of state.items) {
    const assignment = item.assignment;
    if (assignment.kind === "new-lesson" && assignment.moduleKey === moduleKey) {
      ops.push(createLessonOp(item, assignment));
    } else if (assignment.kind === "replace-audio") {
      const operation = getReplaceLessonOp(item, assignment, existing, moduleKey);
      if (operation) ops.push(operation);
    }
  }
  return ops;
}

export function buildCommitDto(state: UploadArrangeState): ArrangeCommitDto {
  const { existing } = state;
  if (!existing) return { lessons: [] };

  if (existing.format === "series") {
    return { lessons: buildLessonOps(state, existing, ROOT_MODULE_KEY) };
  }

  const modules: ArrangeModuleOp[] = [];
  for (const mod of state.newModules) {
    modules.push({
      op: "create",
      slug: mod.slug,
      title: mod.title,
      description: mod.description || undefined,
      status: mod.status,
      orderIndex: mod.orderIndex ?? undefined,
      lessons: buildLessonOps(state, existing, `new:${mod.tempId}`),
    });
  }
  for (const mod of existing.modules) {
    const lessons = buildLessonOps(state, existing, mod.id);
    if (lessons.length > 0) {
      modules.push({ op: "update", id: mod.id, lessons });
    }
  }
  return { modules };
}

/** Slugs staged more than once, or colliding with existing children. */
function getExistingSlugs(state: UploadArrangeState): Set<string> {
  return new Set([
    ...allExistingLessons(state.existing).map((l) => l.slug),
    ...(state.existing?.modules.map((m) => m.slug) ?? []),
  ]);
}

function getStagedSlugs(state: UploadArrangeState): string[] {
  const staged: string[] = [];
  for (const item of state.items) {
    if (item.assignment.kind === "new-lesson") staged.push(item.assignment.slug);
  }
  for (const mod of state.newModules) {
    staged.push(mod.slug);
  }
  return staged;
}

function findSlugConflicts(staged: string[], existingSlugs: Set<string>): string[] {
  const seen = new Set<string>();
  const conflicts = new Set<string>();
  for (const slug of staged) {
    if (!slug) continue;
    if (seen.has(slug) || existingSlugs.has(slug)) conflicts.add(slug);
    seen.add(slug);
  }
  return [...conflicts];
}

export function localSlugConflicts(state: UploadArrangeState): string[] {
  return findSlugConflicts(getStagedSlugs(state), getExistingSlugs(state));
}

export function useUploadArrangeState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return { state, dispatch };
}
