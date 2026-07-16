"use client";

import React, { useState } from "react";
import {
  useApiQuery,
  httpClient,
  endpoints,
  type LivestreamChannelDto,
  type CreateLiveSessionDto,
} from "@sd/core-contracts";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { TextInput } from "@/shared/components/TextInput/TextInput";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { sanitizeError } from "@sd/utils-error";
import styles from "./livestream-modal.module.css";

export interface LivestreamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateLiveSessionDto) => Promise<void>;
}

export function LivestreamScheduleModal({ isOpen, onClose, onSave }: LivestreamScheduleModalProps) {
  const [channelId, setChannelId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active channels for scheduling
  const { data: channelsData } = useApiQuery<{ channels: LivestreamChannelDto[] }>(
    ["admin", "live", "channels"],
    () =>
      httpClient<{ channels: LivestreamChannelDto[] }>({
        url: endpoints.admin.live.listChannels,
        method: "GET",
      }),
    { enabled: isOpen },
  );

  const channels = (channelsData?.channels ?? []).filter((c) => c.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) {
      setError("Please select a livestream channel");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formattedDate = scheduledAt ? new Date(scheduledAt).toISOString() : undefined;

      await onSave({
        channelId,
        title: title.trim() || undefined,
        scheduledAt: formattedDate,
      });
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
      title="Add Scheduled Session"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="schedule-form">
            Schedule Session
          </Button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="schedule-channel" className={styles.label}>
            Select Channel<span className={styles.required}>*</span>
          </label>
          <Dropdown value={channelId} onValueChange={setChannelId}>
            <DropdownTrigger
              id="schedule-channel"
              placeholder="Select Livestream Channel"
              disabled={saving}
            />
            <DropdownContent searchable>
              {channels.map((c) => (
                <DropdownItem key={c.id} value={c.id}>
                  {c.displayName}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="schedule-title" className={styles.label}>
            Session Title / Topic
          </label>
          <TextInput
            id="schedule-title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Explanation of Kitab at-Tawhid"
            disabled={saving}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="schedule-date" className={styles.label}>
            Scheduled Date & Time
          </label>
          <input
            id="schedule-date"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={saving}
            className={styles.datetimeInput}
          />
        </div>
      </form>
    </Modal>
  );
}
