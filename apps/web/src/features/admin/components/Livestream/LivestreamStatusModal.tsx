"use client";

import React, { useState } from "react";
import type { LiveSessionPublicDto, LiveSessionStatus } from "@sd/core-contracts";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { sanitizeError } from "@sd/utils-error";
import styles from "./livestream-modal.module.css";

export interface LivestreamStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: LiveSessionStatus) => Promise<void>;
  session?: LiveSessionPublicDto | null;
}

export function LivestreamStatusModal({
  isOpen,
  onClose,
  onSave,
  session,
}: LivestreamStatusModalProps) {
  const [status, setStatus] = useState<LiveSessionStatus>(session ? session.status : "scheduled");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(status);
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
      title="Change Session Status"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="status-form">
            Save Status
          </Button>
        </>
      }
    >
      <form id="status-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.formGroup}>
          <span className={styles.label}>Choose Live Status</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="session-status"
                value="scheduled"
                checked={status === "scheduled"}
                onChange={() => setStatus("scheduled")}
                disabled={saving}
                className={styles.radioInput}
              />
              <span>Scheduled (Upcoming session)</span>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="session-status"
                value="live"
                checked={status === "live"}
                onChange={() => setStatus("live")}
                disabled={saving}
                className={styles.radioInput}
              />
              <span>Live (Currently broadcasting)</span>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="session-status"
                value="ended"
                checked={status === "ended"}
                onChange={() => setStatus("ended")}
                disabled={saving}
                className={styles.radioInput}
              />
              <span>Ended (Broadcast finished)</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
