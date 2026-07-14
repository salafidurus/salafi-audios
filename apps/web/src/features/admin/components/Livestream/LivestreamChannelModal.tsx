"use client";

import React, { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  LivestreamChannelDto,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
} from "@sd/core-contracts";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import { Toggle } from "@/shared/components/Toggle";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { sanitizeError } from "@sd/utils-error";
import styles from "./livestream-modal.module.css";

export interface LivestreamChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  channel?: LivestreamChannelDto | null;
}

export function LivestreamChannelModal({
  isOpen,
  onClose,
  onSave,
  channel,
}: LivestreamChannelModalProps) {
  const isEditing = !!channel;

  // Form Fields initialized from props on mount/render
  const [displayName, setDisplayName] = useState(channel ? channel.displayName : "");
  const [telegramId, setTelegramId] = useState("");
  const [telegramSlug, setTelegramSlug] = useState(channel?.telegramSlug ?? "");
  const [language, setLanguage] = useState<"en" | "ar">((channel?.language ?? "ar") as "en" | "ar");
  const [scholarId, setScholarId] = useState("");
  const [isActive, setIsActive] = useState(channel ? channel.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch scholars for dropdown selection
  const { data: scholarsData } = useApiQuery<{ scholars: ScholarListItemDto[] }>(
    queryKeys.scholars.list(),
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
    { enabled: isOpen },
  );

  const scholars = scholarsData?.scholars ?? [];

  // Adjust scholarId in render phase once scholars load
  if (
    channel &&
    !scholarId &&
    scholars.length > 0 &&
    (channel.scholarSlug || channel.scholarName)
  ) {
    const match = scholars.find(
      (s) => s.slug === channel.scholarSlug || s.name === channel.scholarName,
    );
    if (match) {
      setScholarId(match.id);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    if (!isEditing && !telegramId.trim()) {
      setError("Telegram Channel ID is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        const updateData: UpdateLivestreamChannelDto = {
          displayName,
          telegramSlug: telegramSlug.trim() || undefined,
          language,
          isActive,
          scholarId: scholarId || undefined,
        };
        await onSave(updateData);
      } else {
        const createData: CreateLivestreamChannelDto = {
          displayName,
          telegramId: telegramId.trim(),
          telegramSlug: telegramSlug.trim() || undefined,
          language,
          scholarId: scholarId || undefined,
        };
        await onSave(createData);
      }
      onClose();
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Livestream Channel" : "Add Livestream Channel"}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="channel-form">
            {isEditing ? "Save Changes" : "Add Channel"}
          </Button>
        </>
      }
    >
      <form id="channel-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="channel-display-name" className={styles.label}>
            Display Name<span className={styles.required}>*</span>
          </label>
          <TextInput
            id="channel-display-name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Live Class Channel"
            required
            disabled={saving}
          />
        </div>

        {!isEditing && (
          <div className={styles.formGroup}>
            <label htmlFor="channel-telegram-id" className={styles.label}>
              Telegram Channel ID<span className={styles.required}>*</span>
            </label>
            <TextInput
              id="channel-telegram-id"
              value={telegramId}
              onChangeText={setTelegramId}
              placeholder="e.g. -1001234567890"
              required
              disabled={saving}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="channel-telegram-slug" className={styles.label}>
            Telegram Username / Slug
          </label>
          <TextInput
            id="channel-telegram-slug"
            value={telegramSlug}
            onChangeText={setTelegramSlug}
            placeholder="e.g. my_channel_username"
            disabled={saving}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="channel-language" className={styles.label}>
              Language
            </label>
            <Dropdown value={language} onValueChange={(val) => setLanguage(val as "en" | "ar")}>
              <DropdownTrigger id="channel-language" disabled={saving} />
              <DropdownContent>
                <DropdownItem value="ar">Arabic (ar)</DropdownItem>
                <DropdownItem value="en">English (en)</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="channel-scholar" className={styles.label}>
              Scholar Connection
            </label>
            <Dropdown value={scholarId} onValueChange={setScholarId}>
              <DropdownTrigger
                id="channel-scholar"
                placeholder="Select Scholar"
                disabled={saving}
              />
              <DropdownContent searchable>
                <DropdownItem value="">None</DropdownItem>
                {scholars.map((s) => (
                  <DropdownItem key={s.id} value={s.id}>
                    {s.name}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        {isEditing && (
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Channel Status</span>
              <span className={styles.toggleDescription}>
                Inactive channels do not poll updates or display in public streams
              </span>
            </div>
            <Toggle checked={isActive} onChange={setIsActive} disabled={saving} />
          </div>
        )}
      </form>
    </Modal>
  );
}
