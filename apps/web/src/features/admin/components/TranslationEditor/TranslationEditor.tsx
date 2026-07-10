"use client";

import { useState } from "react";
import { SUPPORTED_LOCALES, type Locale } from "@sd/core-i18n";
import {
  useContentTranslations,
  useSaveTranslation,
  usePublishTranslation,
  useUnpublishTranslation,
} from "@sd/domain-content";
import type { TranslationTarget } from "@sd/core-contracts";
import { UnpublishTranslationConfirmModal } from "@/features/admin/components/UnpublishTranslationConfirmModal";

type Field = { key: string; label: string; multiline?: boolean };

export type TranslationEditorProps = {
  target: TranslationTarget;
  fields: Field[];
  originalValues: Record<string, string | null>;
};

export function TranslationEditor({ target, fields, originalValues }: TranslationEditorProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>(SUPPORTED_LOCALES[0]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);

  const { data } = useContentTranslations(target);
  const saveTranslation = useSaveTranslation(target);
  const publishTranslation = usePublishTranslation(target);
  const unpublishTranslation = useUnpublishTranslation(target);

  const active = data?.translations.find((t) => t.locale === activeLocale);

  const getFieldValue = (key: string) => fieldValues[key] ?? active?.fields[key] ?? "";

  const handleSave = () => {
    const mergedFields: Record<string, string | null> = {};
    for (const field of fields) {
      mergedFields[field.key] = fieldValues[field.key] ?? active?.fields[field.key] ?? null;
    }
    saveTranslation.mutate({ locale: activeLocale, fields: mergedFields });
  };

  const handlePublish = () => {
    publishTranslation.mutate(activeLocale);
  };

  const handleUnpublishClick = () => {
    setUnpublishModalOpen(true);
  };

  const handleConfirmUnpublish = async () => {
    unpublishTranslation.mutate(activeLocale);
    setUnpublishModalOpen(false);
  };

  return (
    <div>
      <UnpublishTranslationConfirmModal
        isOpen={unpublishModalOpen}
        onClose={() => setUnpublishModalOpen(false)}
        onConfirm={handleConfirmUnpublish}
      />

      <div>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            aria-pressed={locale === activeLocale}
            onClick={() => {
              setActiveLocale(locale);
              setFieldValues({});
            }}
          >
            {locale}
          </button>
        ))}
      </div>

      {active && <span data-testid="status-badge">{active.status}</span>}

      <div>
        {fields.map((field) =>
          field.multiline ? (
            <textarea
              key={field.key}
              aria-label={field.label}
              placeholder={originalValues[field.key] ?? ""}
              value={getFieldValue(field.key)}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
          ) : (
            <input
              key={field.key}
              type="text"
              aria-label={field.label}
              placeholder={originalValues[field.key] ?? ""}
              value={getFieldValue(field.key)}
              onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
          ),
        )}
      </div>

      <div>
        <button type="button" onClick={handleSave} disabled={saveTranslation.isPending}>
          Save draft
        </button>
        {active?.status === "draft" && (
          <button type="button" onClick={handlePublish} disabled={publishTranslation.isPending}>
            Publish
          </button>
        )}
        {active?.status === "published" && (
          <button
            type="button"
            onClick={handleUnpublishClick}
            disabled={unpublishTranslation.isPending}
          >
            Unpublish
          </button>
        )}
      </div>
    </div>
  );
}
