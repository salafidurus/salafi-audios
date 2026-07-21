"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { useTranslation } from "@/core/i18n/use-translation";

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
  const { t } = useTranslation();

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
      title={t("admin.contents.unpublish.title", "Unpublish Translation?")}
      size="sm"
      loading={isUnpublishing}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUnpublishing}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isUnpublishing}>
            {isUnpublishing
              ? t("admin.contents.unpublish.unpublishing", "Unpublishing…")
              : t("admin.contents.unpublish.unpublishBtn", "Unpublish")}
          </Button>
        </>
      }
    >
      <p>
        {t("admin.contents.unpublish.prompt", {
          defaultValue: "Are you sure you want to unpublish this {{label}}?",
          label: translationLabel,
        })}
      </p>
      <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
        {t("admin.contents.unpublish.warning", "It will no longer be visible to users.")}
      </p>
    </Modal>
  );
}
