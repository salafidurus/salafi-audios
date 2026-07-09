"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/Modal/Modal";
import styles from "./ConfirmModal.module.css";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  confirmWord?: string;
  testId?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  confirmWord,
  testId,
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");

  const isWordConfirmed = confirmWord ? inputValue === confirmWord : true;

  const handleConfirm = () => {
    if (!isWordConfirmed) return;
    onConfirm();
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <div className={styles.body} data-testid={testId}>
        <p className={styles.message}>{message}</p>

        {confirmWord && (
          <div className={styles.wordConfirm}>
            <label className={styles.wordLabel}>
              Type <strong>{confirmWord}</strong> to confirm:
            </label>
            <input
              type="text"
              className={styles.wordInput}
              placeholder={`Type "${confirmWord}" to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          data-testid="confirm-modal-cancel"
          className={styles.cancelButton}
          onClick={handleClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          data-testid="confirm-modal-confirm"
          className={`${styles.confirmButton} ${confirmVariant === "danger" ? styles.confirmDanger : styles.confirmPrimary}`}
          onClick={handleConfirm}
          disabled={!isWordConfirmed}
        >
          {confirmLabel}
        </button>
      </footer>
    </Modal>
  );
}
