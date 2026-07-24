"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../Button";
import { useTranslation } from "@/core/i18n/use-translation";
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
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  confirmWord,
  testId,
}: ConfirmTextProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const displayConfirmLabel = confirmLabel || t("common.confirm", "Confirm");
  const displayCancelLabel = cancelLabel || t("common.cancel", "Cancel");
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
      width="narrow"
      height="auto"
      footer={
        <>
          <Button variant="outline" data-testid="confirm-modal-cancel" onClick={handleClose}>
            {displayCancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            data-testid="confirm-modal-confirm"
            onClick={handleConfirm}
            disabled={!isWordConfirmed}
          >
            {displayConfirmLabel}
          </Button>
        </>
      }
    >
      <div className={styles.body} data-testid={testId}>
        <p className={styles.message}>{message}</p>

        {confirmWord && (
          <div className={styles.wordConfirm}>
            <label className={styles.wordLabel} htmlFor="confirm-text-input">
              {t("modal.typeLabel", "Type")} <strong>{confirmWord}</strong>{" "}
              {t("modal.toConfirmLabel", "to confirm:")}
            </label>
            <input
              id="confirm-text-input"
              type="text"
              className={styles.wordInput}
              placeholder={t("modal.confirmPlaceholder", {
                defaultValue: `Type "${confirmWord}" to confirm`,
                confirmWord,
              })}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
