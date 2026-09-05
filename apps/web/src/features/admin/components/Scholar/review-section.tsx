/** Documents this module's responsibility and public boundary. */
"use client";

import Image from "next/image";

import { useTranslation } from "@/core/i18n/use-translation";
import { FormSection } from "@/features/admin/components/FormSection";

import type { FormState } from "../../hooks/Scholar/useScholarForm";

import styles from "./review-section.module.css";

interface ReviewSectionProps {
  formData: FormState;
  changedFields: Record<string, boolean>;
  stagedImagePreview: string | null;
}

type ReviewFieldProps = {
  label: string;
  value: string | number;
};

const DETAIL_CHANGE_KEYS = ["name", "slug", "bio", "title", "country", "orderIndex"];
const SOCIAL_CHANGE_KEYS = ["socialTwitter", "socialTelegram", "socialYoutube", "socialWebsite"];

function hasChangedField(changedFields: Record<string, boolean>, keys: string[]) {
  return keys.some((key) => changedFields[key]);
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}

type ReviewContentProps = Pick<ReviewSectionProps, "formData" | "changedFields"> & {
  t: ReturnType<typeof useTranslation>["t"];
};

function ReviewDetails({ formData, changedFields, t }: ReviewContentProps) {
  const fields = [
    [changedFields.name, formData.name, t("admin.scholars.nameLabel", "Name")],
    [changedFields.slug, formData.slug, t("admin.scholars.slugLabel", "Slug")],
    [changedFields.bio, formData.bio, t("admin.scholars.bioLabel", "Bio")],
    [changedFields.title, formData.title, t("admin.scholars.titleLabel", "Title")],
    [changedFields.country, formData.country, t("admin.scholars.countryLabel", "Country")],
  ] as const;

  return (
    <FormSection title={t("admin.scholars.details", "Details")}>
      <div className={styles.grid}>
        {fields.map(([changed, value, label]) =>
          changed && value ? <ReviewField key={label} label={label} value={value} /> : null,
        )}
        {changedFields.orderIndex && formData.orderIndex !== undefined ? (
          <ReviewField
            label={t("admin.scholars.orderIndexLabel", "Order Index")}
            value={formData.orderIndex}
          />
        ) : null}
      </div>
    </FormSection>
  );
}

function ReviewSocial({ formData, changedFields, t }: ReviewContentProps) {
  const fields = [
    [changedFields.socialTwitter, formData.socialTwitter, "Twitter"],
    [changedFields.socialTelegram, formData.socialTelegram, "Telegram"],
    [changedFields.socialYoutube, formData.socialYoutube, "YouTube"],
    [changedFields.socialWebsite, formData.socialWebsite, "Website"],
  ] as const;

  return (
    <FormSection title={t("admin.scholars.socialMedia", "Social Media")}>
      <div className={styles.grid}>
        {fields.map(([changed, value, label]) =>
          changed && value ? <ReviewField key={label} label={label} value={value} /> : null,
        )}
      </div>
    </FormSection>
  );
}

/** Summarizes changed scholar fields and staged imagery before submission. */
export function ReviewSection({ formData, changedFields, stagedImagePreview }: ReviewSectionProps) {
  const { t } = useTranslation();

  // Check if any changed field should be displayed
  const hasDetailChanges = hasChangedField(changedFields, DETAIL_CHANGE_KEYS);
  const hasSocialChanges = hasChangedField(changedFields, SOCIAL_CHANGE_KEYS);
  const hasAnyData = hasDetailChanges || hasSocialChanges || stagedImagePreview;

  if (!hasAnyData) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
        </p>
      </div>
    );
  }

  return (
    <>
      {stagedImagePreview && (
        <FormSection title={t("admin.scholars.avatar", "Avatar")}>
          <div className={styles.imagePreview}>
            <Image
              src={stagedImagePreview}
              alt={formData.name}
              fill
              sizes="200px"
              className={styles.imageContent}
            />
          </div>
        </FormSection>
      )}
      {hasDetailChanges ? (
        <ReviewDetails formData={formData} changedFields={changedFields} t={t} />
      ) : null}
      {hasSocialChanges ? (
        <ReviewSocial formData={formData} changedFields={changedFields} t={t} />
      ) : null}
    </>
  );
}
