"use client";

import { useState, type ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  error?: ReactNode;
  children?: ReactNode;
  confirmDisabled?: boolean;
  testId?: string;
  cancelTestId?: string;
  modalTestId?: string;
};

function ConfirmationDialogFooter({
  cancelLabel,
  confirmLabel,
  variant,
  isLoading,
  confirmDisabled,
  cancelTestId,
  testId,
  onCancel,
  onConfirm,
  t,
}: {
  cancelLabel?: string;
  confirmLabel: string;
  variant: "default" | "destructive";
  isLoading: boolean;
  confirmDisabled: boolean;
  cancelTestId?: string;
  testId?: string;
  onCancel: () => void;
  onConfirm: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        data-testid={cancelTestId}
      >
        {cancelLabel ?? t("common.cancel", "Cancel")}
      </Button>
      <Button
        type="button"
        variant={variant === "destructive" ? "danger" : "primary"}
        onClick={onConfirm}
        loading={isLoading}
        disabled={isLoading || confirmDisabled}
        data-testid={testId}
      >
        {confirmLabel}
      </Button>
    </DialogFooter>
  );
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  error,
  children,
  confirmDisabled = false,
  testId,
  cancelTestId,
  modalTestId,
}: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const isLoading = isConfirming;

  const confirm = async () => {
    if (!onConfirm || isLoading) return;
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // The caller owns the localized error state; keep the dialog open for retry.
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isLoading) onOpenChange(false);
      }}
    >
      <DialogContent showCloseButton={!isLoading} data-testid={modalTestId}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <ConfirmationDialogFooter
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          variant={variant}
          isLoading={isLoading}
          confirmDisabled={confirmDisabled}
          cancelTestId={cancelTestId}
          testId={testId}
          onCancel={() => onOpenChange(false)}
          onConfirm={confirm}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}

type ConfirmationTextDialogProps = Omit<ConfirmationDialogProps, "description" | "children"> & {
  message: ReactNode;
  confirmWord: string;
};

export function ConfirmationTextDialog({
  message,
  confirmWord,
  onConfirm,
  ...props
}: ConfirmationTextDialogProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const isValid = value === confirmWord;

  return (
    <ConfirmationDialog
      {...props}
      onConfirm={async () => {
        if (isValid) await onConfirm?.();
      }}
      confirmDisabled={!isValid}
    >
      <p>{message}</p>
      <label className="mt-4 block text-sm" htmlFor="confirmation-text-input">
        {t("common.typeToConfirm", "Type {{word}} to confirm", { word: confirmWord })}
      </label>
      <input
        id="confirmation-text-input"
        className="mt-2 min-h-12 w-full rounded-lg border bg-background px-3"
        placeholder={t("common.confirmationPlaceholder", 'Type "{{word}}" to confirm', {
          word: confirmWord,
        })}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </ConfirmationDialog>
  );
}
