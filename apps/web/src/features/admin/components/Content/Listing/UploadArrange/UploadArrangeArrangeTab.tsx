"use client";

import type { AdminArrangeLessonDto, StatusValue } from "@sd/core-contracts";

import { Reorder } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  ROOT_MODULE_KEY,
  localSlugConflicts,
  resolveParentSlug,
  type ModuleKey,
  type NewModule,
  type UploadArrangeAction,
  type UploadArrangeState,
  type UploadItem,
} from "@/features/admin/hooks/Content/useUploadArrangeState";
import { deriveChildSlug } from "@/features/admin/utils/upload-filename";
import { Button } from "@/shared/components/Button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { InputField } from "@/shared/components/InputField";

import modalStyles from "../listing-modal.module.css";
import styles from "./upload-arrange.module.css";

interface UploadArrangeArrangeTabProps {
  state: UploadArrangeState;
  dispatch: React.Dispatch<UploadArrangeAction>;
}

const STATUS_OPTIONS: { value: StatusValue; label: string; fallback: string }[] = [
  { value: "draft", label: "admin.contents.listing.draft", fallback: "Draft" },
  { value: "review", label: "admin.contents.listing.review", fallback: "In Review" },
  { value: "published", label: "admin.contents.listing.published", fallback: "Published" },
];

/** Strips a known immediate-parent prefix off a full slug, for display as an editable suffix. */
function suffixFromSlug(slug: string, prefix: string): string {
  const withDash = `${prefix}-`;
  return prefix && slug.startsWith(withDash) ? slug.slice(withDash.length) : slug;
}

/**
 * A slug field whose immediate-parent prefix is locked (shown as a fixed badge) so it can
 * never be edited away from the prefix the server requires — only the suffix is editable.
 * The full, recombined slug is what gets dispatched on every change.
 */
function PrefixedSlugField({
  id,
  prefix,
  slug,
  onChange,
  hasConflict,
}: {
  id: string;
  prefix: string;
  slug: string;
  onChange: (nextSlug: string) => void;
  hasConflict: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={modalStyles.formGroup}>
      <label htmlFor={id} className={modalStyles.label}>
        {t("admin.contents.listing.slugLabel", "Slug")}
      </label>
      <div className={modalStyles.slugPrefixGroup}>
        {prefix && <span className={modalStyles.slugPrefixBadge}>{prefix}-</span>}
        <InputField
          id={id}
          value={suffixFromSlug(slug, prefix)}
          onChange={(value) => onChange(prefix ? deriveChildSlug(prefix, value) : value)}
        />
      </div>
      {hasConflict && (
        <span className={styles.conflictText}>
          {t("admin.contents.listing.slugConflict", "This slug is already in use")}
        </span>
      )}
    </div>
  );
}

function StagedItemCard({
  item,
  state,
  dispatch,
  lessonsInScope,
  conflictSlugs,
  moduleOptions,
}: {
  item: UploadItem;
  state: UploadArrangeState;
  dispatch: React.Dispatch<UploadArrangeAction>;
  lessonsInScope: AdminArrangeLessonDto[];
  conflictSlugs: Set<string>;
  moduleOptions: { key: ModuleKey; title: string }[] | null;
}) {
  const { t } = useTranslation();
  const assignment = item.assignment;
  const slug = assignment.kind === "new-lesson" ? assignment.slug : null;
  const hasConflict = slug !== null && conflictSlugs.has(slug);

  return (
    <div className={`${styles.stagedItem} ${hasConflict ? styles.stagedItemConflict : ""}`}>
      <div className={styles.stagedItemHeader}>
        <GripVertical size={16} className={styles.dragHandle} />
        <span className={styles.stagedItemTitle}>{item.title}</span>

        <Dropdown
          value={assignment.kind === "replace-audio" ? `replace:${assignment.lessonId}` : "new"}
          onValueChange={(value) => {
            if (value === "new") {
              dispatch({
                type: "SET_ASSIGNMENT",
                itemId: item.id,
                assignment: {
                  kind: "new-lesson",
                  moduleKey:
                    item.assignment.kind === "new-lesson"
                      ? item.assignment.moduleKey
                      : ROOT_MODULE_KEY,
                  slug: slug ?? "",
                  slugEdited: assignment.kind === "new-lesson" ? assignment.slugEdited : false,
                  description: "",
                  status: "draft",
                  orderIndex: item.numericPrefix,
                },
              });
            } else if (value.startsWith("replace:")) {
              dispatch({
                type: "SET_ASSIGNMENT",
                itemId: item.id,
                assignment: { kind: "replace-audio", lessonId: value.slice("replace:".length) },
              });
            }
          }}
        >
          <DropdownTrigger
            placeholder={t("admin.contents.listing.assignmentPlaceholder", "Assignment")}
          />
          <DropdownContent>
            <DropdownItem value="new">
              {t("admin.contents.listing.newLesson", "New lesson")}
            </DropdownItem>
            {lessonsInScope.map((lesson) => (
              <DropdownItem key={lesson.id} value={`replace:${lesson.id}`}>
                {t("admin.contents.listing.replaceAudioOf", "Replace audio:")} {lesson.title}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>

      {item.suggestion && !item.suggestion.dismissed && (
        <div className={styles.suggestionChip}>
          <span>
            {t("admin.contents.listing.slugMatchSuggestion", "Filename matches existing lesson")}{" "}
            &ldquo;{item.suggestion.lessonTitle}&rdquo;
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "ACCEPT_SUGGESTION", itemId: item.id })}
          >
            {t("admin.contents.listing.replaceItsAudio", "Replace its audio")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "DISMISS_SUGGESTION", itemId: item.id })}
          >
            {t("admin.contents.listing.keepAsNew", "Keep as new lesson")}
          </Button>
        </div>
      )}

      {assignment.kind === "new-lesson" && (
        <div className={styles.fieldGrid}>
          {moduleOptions && (
            <div className={modalStyles.formGroup}>
              <span className={modalStyles.label}>
                {t("admin.contents.listing.moduleLabel", "Module")}
              </span>
              <Dropdown
                value={assignment.moduleKey}
                onValueChange={(value) =>
                  dispatch({
                    type: "SET_ASSIGNMENT",
                    itemId: item.id,
                    assignment: { ...assignment, moduleKey: value },
                  })
                }
              >
                <DropdownTrigger
                  placeholder={t("admin.contents.listing.selectModule", "Select module")}
                />
                <DropdownContent>
                  {moduleOptions.map((mod) => (
                    <DropdownItem key={mod.key} value={mod.key}>
                      {mod.title}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
          )}
          <PrefixedSlugField
            id={`item-${item.id}-slug`}
            prefix={resolveParentSlug(state, assignment.moduleKey)}
            slug={assignment.slug}
            onChange={(value) =>
              dispatch({ type: "SET_LESSON_FIELD", itemId: item.id, field: "slug", value })
            }
            hasConflict={hasConflict}
          />
          <div className={modalStyles.formGroup}>
            <span className={modalStyles.label}>
              {t("admin.contents.listing.statusLabel", "Status")}
            </span>
            <Dropdown
              value={assignment.status}
              onValueChange={(value) =>
                dispatch({ type: "SET_LESSON_FIELD", itemId: item.id, field: "status", value })
              }
            >
              <DropdownTrigger
                placeholder={t("admin.contents.listing.statusPlaceholder", "Select Status")}
              />
              <DropdownContent>
                {STATUS_OPTIONS.map((option) => (
                  <DropdownItem key={option.value} value={option.value}>
                    {t(option.label, option.fallback)}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>
          <div className={modalStyles.formGroup}>
            <span className={modalStyles.label}>
              {t("admin.contents.listing.orderIndexLabel", "Order")}
            </span>
            <InputField
              type="number"
              value={assignment.orderIndex === null ? "" : String(assignment.orderIndex)}
              onChange={(value) =>
                dispatch({
                  type: "SET_LESSON_FIELD",
                  itemId: item.id,
                  field: "orderIndex",
                  value: value === "" ? null : Number(value),
                })
              }
            />
          </div>
          <div className={modalStyles.formGroup}>
            <span className={modalStyles.label}>
              {t("admin.contents.listing.descriptionLabel", "Description")}
            </span>
            <InputField
              value={assignment.description}
              onChange={(value) =>
                dispatch({ type: "SET_LESSON_FIELD", itemId: item.id, field: "description", value })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StagedList({
  moduleKey,
  state,
  dispatch,
  lessonsInScope,
  conflictSlugs,
  moduleOptions,
}: {
  moduleKey: ModuleKey;
  state: UploadArrangeState;
  dispatch: React.Dispatch<UploadArrangeAction>;
  lessonsInScope: AdminArrangeLessonDto[];
  conflictSlugs: Set<string>;
  moduleOptions: { key: ModuleKey; title: string }[] | null;
}) {
  const staged = state.items.filter(
    (item) =>
      (item.assignment.kind === "new-lesson" && item.assignment.moduleKey === moduleKey) ||
      (item.assignment.kind === "replace-audio" &&
        lessonsInScope.some(
          (lesson) =>
            item.assignment.kind === "replace-audio" && lesson.id === item.assignment.lessonId,
        )),
  );

  if (staged.length === 0) return null;

  return (
    <Reorder.Group
      axis="y"
      as="div"
      values={staged.map((item) => item.id)}
      onReorder={(orderedIds: string[]) =>
        dispatch({ type: "REORDER", moduleKey, orderedItemIds: orderedIds })
      }
      className={styles.arrangeStack}
    >
      {staged.map((item) => (
        <Reorder.Item key={item.id} value={item.id} as="div">
          <StagedItemCard
            item={item}
            state={state}
            dispatch={dispatch}
            lessonsInScope={lessonsInScope}
            conflictSlugs={conflictSlugs}
            moduleOptions={moduleOptions}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

function NewModuleCard({
  mod,
  rootSlug,
  dispatch,
  conflictSlugs,
}: {
  mod: NewModule;
  rootSlug: string;
  dispatch: React.Dispatch<UploadArrangeAction>;
  conflictSlugs: Set<string>;
}) {
  const { t } = useTranslation();
  const hasConflict = conflictSlugs.has(mod.slug);

  return (
    <div className={styles.fieldGrid}>
      <PrefixedSlugField
        id={`module-${mod.tempId}-slug`}
        prefix={rootSlug}
        slug={mod.slug}
        onChange={(value) =>
          dispatch({ type: "EDIT_MODULE", tempId: mod.tempId, field: "slug", value })
        }
        hasConflict={hasConflict}
      />
      <div className={modalStyles.formGroup}>
        <label htmlFor={`module-${mod.tempId}-status`} className={modalStyles.label}>
          {t("admin.contents.listing.statusLabel", "Status")}
        </label>
        <Dropdown
          value={mod.status}
          onValueChange={(value) =>
            dispatch({ type: "EDIT_MODULE", tempId: mod.tempId, field: "status", value })
          }
        >
          <DropdownTrigger
            id={`module-${mod.tempId}-status`}
            placeholder={t("admin.contents.listing.statusPlaceholder", "Select Status")}
          />
          <DropdownContent>
            {STATUS_OPTIONS.map((option) => (
              <DropdownItem key={option.value} value={option.value}>
                {t(option.label, option.fallback)}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      </div>
      <div className={modalStyles.formGroup}>
        <label htmlFor={`module-${mod.tempId}-order`} className={modalStyles.label}>
          {t("admin.contents.listing.orderIndexLabel", "Order")}
        </label>
        <InputField
          id={`module-${mod.tempId}-order`}
          type="number"
          value={mod.orderIndex === null ? "" : String(mod.orderIndex)}
          onChange={(value) =>
            dispatch({
              type: "EDIT_MODULE",
              tempId: mod.tempId,
              field: "orderIndex",
              value: value === "" ? null : Number(value),
            })
          }
        />
      </div>
      <div className={modalStyles.formGroup}>
        <label htmlFor={`module-${mod.tempId}-description`} className={modalStyles.label}>
          {t("admin.contents.listing.descriptionLabel", "Description")}
        </label>
        <InputField
          id={`module-${mod.tempId}-description`}
          value={mod.description}
          onChange={(value) =>
            dispatch({ type: "EDIT_MODULE", tempId: mod.tempId, field: "description", value })
          }
        />
      </div>
    </div>
  );
}

export function UploadArrangeArrangeTab({ state, dispatch }: UploadArrangeArrangeTabProps) {
  const { t } = useTranslation();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const { existing } = state;

  if (!existing) return null;

  if (state.items.length === 0 && state.newModules.length === 0) {
    return (
      <div className={styles.emptyHint}>
        {t("admin.contents.listing.arrangeEmpty", "Add audio files in the Upload tab first.")}
      </div>
    );
  }

  const conflictSlugs = new Set([...localSlugConflicts(state), ...state.conflictSlugs]);

  if (existing.format === "single") {
    return (
      <div className={styles.arrangeStack}>
        {existing.audioUrl && (
          <div className={styles.existingLesson}>
            {t("admin.contents.listing.currentAudio", "Current audio:")} {existing.audioUrl}
          </div>
        )}
        {state.items.map((item) => (
          <div key={item.id} className={styles.stagedItem}>
            <div className={styles.stagedItemHeader}>
              <span className={styles.stagedItemTitle}>{item.filename}</span>
              <span className={styles.fileMeta}>
                {t("admin.contents.listing.replacesPrimaryAudio", "Replaces the primary audio")}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (existing.format === "series") {
    return (
      <div className={styles.arrangeStack}>
        {existing.lessons.length > 0 && (
          <div className={styles.moduleSection}>
            <span className={styles.moduleSlug}>
              {t("admin.contents.listing.existingLessons", "Existing lessons")}
            </span>
            {existing.lessons.map((lesson) => (
              <div key={lesson.id} className={styles.existingLesson}>
                <span className={styles.orderBadge}>{lesson.orderIndex ?? "—"}</span>
                {lesson.title}
              </div>
            ))}
          </div>
        )}
        <StagedList
          moduleKey={ROOT_MODULE_KEY}
          state={state}
          dispatch={dispatch}
          lessonsInScope={existing.lessons}
          conflictSlugs={conflictSlugs}
          moduleOptions={null}
        />
      </div>
    );
  }

  // Collection: modules (existing + staged) with per-module lesson lists.
  const moduleOptions = [
    ...existing.modules.map((mod) => ({ key: mod.id, title: mod.title })),
    ...state.newModules.map((mod) => ({ key: `new:${mod.tempId}`, title: mod.title })),
  ];
  const unassigned = state.items.filter(
    (item) =>
      item.assignment.kind === "new-lesson" && item.assignment.moduleKey === ROOT_MODULE_KEY,
  );

  return (
    <div className={styles.arrangeStack}>
      <div className={styles.addModuleRow}>
        <InputField
          value={newModuleTitle}
          onChange={setNewModuleTitle}
          placeholder={t("admin.contents.listing.newModuleTitle", "New module title")}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!newModuleTitle.trim()}
          onClick={() => {
            dispatch({ type: "ADD_MODULE", title: newModuleTitle.trim() });
            setNewModuleTitle("");
          }}
        >
          <Plus size={14} /> {t("admin.contents.listing.addModule", "Add module")}
        </Button>
      </div>

      {unassigned.length > 0 && (
        <div className={styles.moduleSection}>
          <div className={styles.moduleHeader}>
            <span className={styles.moduleTitle}>
              {t("admin.contents.listing.unassigned", "Unassigned")}
            </span>
            <span className={styles.conflictText}>
              {t(
                "admin.contents.listing.assignBeforeUpload",
                "Assign these to a module before uploading",
              )}
            </span>
          </div>
          <StagedList
            moduleKey={ROOT_MODULE_KEY}
            state={state}
            dispatch={dispatch}
            lessonsInScope={[]}
            conflictSlugs={conflictSlugs}
            moduleOptions={moduleOptions}
          />
        </div>
      )}

      {state.newModules.map((mod) => (
        <div key={mod.tempId} className={styles.moduleSection}>
          <div className={styles.moduleHeader}>
            <div className={styles.moduleTitle}>{mod.title}</div>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={t("admin.contents.listing.removeModule", "Remove module")}
              onClick={() => dispatch({ type: "REMOVE_MODULE", tempId: mod.tempId })}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <NewModuleCard
            mod={mod}
            rootSlug={existing.slug}
            dispatch={dispatch}
            conflictSlugs={conflictSlugs}
          />
          <StagedList
            moduleKey={`new:${mod.tempId}`}
            state={state}
            dispatch={dispatch}
            lessonsInScope={[]}
            conflictSlugs={conflictSlugs}
            moduleOptions={moduleOptions}
          />
        </div>
      ))}

      {existing.modules.map((mod) => (
        <div key={mod.id} className={styles.moduleSection}>
          <div className={styles.moduleHeader}>
            <div>
              <div className={styles.moduleTitle}>{mod.title}</div>
              <div className={styles.moduleSlug}>{mod.slug}</div>
            </div>
          </div>
          {mod.lessons.map((lesson) => (
            <div key={lesson.id} className={styles.existingLesson}>
              <span className={styles.orderBadge}>{lesson.orderIndex ?? "—"}</span>
              {lesson.title}
            </div>
          ))}
          <StagedList
            moduleKey={mod.id}
            state={state}
            dispatch={dispatch}
            lessonsInScope={mod.lessons}
            conflictSlugs={conflictSlugs}
            moduleOptions={moduleOptions}
          />
        </div>
      ))}
    </div>
  );
}
