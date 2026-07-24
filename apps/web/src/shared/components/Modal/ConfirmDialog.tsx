"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  testId?: string;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  loading: externalLoading,
  testId,
  children,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    const result = onConfirm();
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
        onClose();
      } catch (err) {
        console.error("Confirmation action failed:", err);
      } finally {
        setInternalLoading(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="auto"
      height="auto"
      loading={isLoading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testid={testId ? `${testId}-cancel` : undefined}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
            data-testid={testId ? `${testId}-confirm` : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div data-testid={testId}>{children}</div>
    </Modal>
  );
}
