"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "../Modal";
import { Button } from "../Button";

interface DeleteTopicConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  topicName: string;
}

export function DeleteTopicConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  topicName,
}: DeleteTopicConfirmModalProps): ReactNode {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Topic?"
      size="sm"
      loading={isDeleting}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete Topic"}
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to delete the topic <strong>{topicName}</strong>?
      </p>
      <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
        This action cannot be undone.
      </p>
    </Modal>
  );
}
