"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/shared/components/Button";
import { useTranslation } from "@/core/i18n/use-translation";

interface RevokePermissionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  permissionName: string;
  userName: string;
}

export function RevokePermissionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  permissionName,
  userName,
}: RevokePermissionConfirmModalProps): ReactNode {
  const [isRevoking, setIsRevoking] = useState(false);
  const { t } = useTranslation();

  const handleConfirm = async () => {
    setIsRevoking(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.permissions.revokeTitle", "Revoke Permission?")}
      size="sm"
      loading={isRevoking}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isRevoking}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isRevoking}>
            {isRevoking
              ? t("admin.permissions.revoking", "Revoking…")
              : t("admin.permissions.revokeButton", "Revoke Permission")}
          </Button>
        </>
      }
    >
      <p>
        {t("admin.permissions.revokePrompt", {
          defaultValue: "Are you sure you want to revoke {{permission}} from {{user}}?",
          permission: permissionName,
          user: userName,
        })}
      </p>
      <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
        {t(
          "admin.permissions.revokeWarning",
          "This will remove their access to this functionality.",
        )}
      </p>
    </Modal>
  );
}
