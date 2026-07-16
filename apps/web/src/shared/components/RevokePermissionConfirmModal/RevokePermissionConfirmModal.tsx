"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";

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
      title="Revoke Permission?"
      size="sm"
      loading={isRevoking}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isRevoking}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isRevoking}>
            {isRevoking ? "Revoking…" : "Revoke Permission"}
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to revoke <strong>{permissionName}</strong> from{" "}
        <strong>{userName}</strong>?
      </p>
      <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
        This will remove their access to this functionality.
      </p>
    </Modal>
  );
}
