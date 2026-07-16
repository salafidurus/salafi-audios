"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";

interface UnpublishTranslationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  translationLabel?: string;
}

export function UnpublishTranslationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  translationLabel = "translation",
}: UnpublishTranslationConfirmModalProps): ReactNode {
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const handleConfirm = async () => {
    setIsUnpublishing(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unpublish Translation?"
      size="sm"
      loading={isUnpublishing}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUnpublishing}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isUnpublishing}>
            {isUnpublishing ? "Unpublishing…" : "Unpublish"}
          </Button>
        </>
      }
    >
      <p>Are you sure you want to unpublish this {translationLabel}?</p>
      <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
        It will no longer be visible to users.
      </p>
    </Modal>
  );
}
