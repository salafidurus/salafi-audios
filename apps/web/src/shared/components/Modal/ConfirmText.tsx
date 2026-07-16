"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button";
import styles from "./confirm.module.css";

export interface ConfirmTextProps {
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

export function ConfirmText({
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
}: ConfirmTextProps) {
  const [inputValue, setInputValue] = useState("");

  const isWordConfirmed = confirmWord ? inputValue === confirmWord : true;

  const handleConfirm = () => {
    if (!isWordConfirmed) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" data-testid="confirm-modal-cancel" onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            data-testid="confirm-modal-confirm"
            onClick={handleConfirm}
            disabled={!isWordConfirmed}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.body} data-testid={testId}>
        <p className={styles.message}>{message}</p>

        {confirmWord && (
          <div className={styles.wordConfirm}>
            <label className={styles.wordLabel} htmlFor="confirm-text-input">
              Type <strong>{confirmWord}</strong> to confirm:
            </label>
            <input
              id="confirm-text-input"
              type="text"
              className={styles.wordInput}
              placeholder={`Type "${confirmWord}" to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
