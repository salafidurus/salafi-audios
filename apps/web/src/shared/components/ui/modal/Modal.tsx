/** Documents this module's responsibility and public boundary. */
"use client";

import { useState, type ReactNode } from "react";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils";

export type ModalWidthVariant = "wide" | "standard" | "narrow" | "auto";
export type ModalHeightVariant = "long" | "standard" | "short" | "auto";
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  modal?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  width?: ModalWidthVariant | string | number;
  height?: ModalHeightVariant | string | number;
  hideFooter?: boolean;
  footerAlignment?: "left" | "right" | "center" | "space-between";
  footerBorder?: boolean;
  loading?: boolean;
  contentClassName?: string;
}

const widthClasses = {
  wide: "sm:max-w-3xl",
  standard: "sm:max-w-xl",
  narrow: "sm:max-w-md",
  auto: "sm:max-w-lg",
} satisfies Record<ModalWidthVariant, string>;
const modalWidthSchema = z.enum(["wide", "standard", "narrow", "auto"]);
function isModalWidth(value: string): value is ModalWidthVariant {
  return modalWidthSchema.safeParse(value).success;
}

function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-0 max-h-[min(70vh,48rem)] overflow-y-auto py-2", className)}>
      {children}
    </div>
  );
}
function ModalHeader({ children }: { children: ReactNode }) {
  return (
    <DialogHeader>
      <DialogTitle>{children}</DialogTitle>
    </DialogHeader>
  );
}
function ModalFooter({
  children,
  alignment = "right",
  border = true,
}: {
  children: ReactNode;
  alignment?: "left" | "right" | "center" | "space-between";
  border?: boolean;
}) {
  const justifyContent =
    alignment === "space-between"
      ? "space-between"
      : alignment === "left"
        ? "flex-start"
        : alignment;
  return (
    <DialogFooter className={border ? undefined : "border-0"} style={{ justifyContent }}>
      {children}
    </DialogFooter>
  );
}

function resolveModalMaxWidth(width: ModalProps["width"]) {
  const parsedWidth = z.union([modalWidthSchema, z.string()]).safeParse(width);
  if (!parsedWidth.success || !isModalWidth(parsedWidth.data)) return undefined;
  return widthClasses[parsedWidth.data];
}

function handleModalOpenChange(open: boolean, loading: boolean | undefined, onClose: () => void) {
  if (!open && !loading) onClose();
}

function renderModalFooter(
  hideFooter: boolean | undefined,
  footer: ReactNode,
  alignment: ModalProps["footerAlignment"],
  border: boolean | undefined,
) {
  if (hideFooter || !footer) return null;
  return (
    <ModalFooter alignment={alignment} border={border}>
      {footer}
    </ModalFooter>
  );
}

function ModalRoot({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  width = "standard",
  modal = true,
  hideFooter,
  footerAlignment = "right",
  footerBorder = true,
  loading,
  contentClassName,
}: ModalProps) {
  const maxWidth = resolveModalMaxWidth(width);
  return (
    <Dialog
      open={isOpen}
      modal={modal}
      onOpenChange={(open) => handleModalOpenChange(open, loading, onClose)}
    >
      <DialogContent className={cn(maxWidth, contentClassName)} data-size={size}>
        {title && <ModalHeader>{title}</ModalHeader>}
        <DialogDescription className="sr-only">Dialog content</DialogDescription>
        {children}
        {renderModalFooter(hideFooter, footer, footerAlignment, footerBorder)}
      </DialogContent>
    </Dialog>
  );
}

function ModalConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  children,
  loading = false,
  testId,
  cancelTestId,
  modalTestId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "danger";
  children?: ReactNode;
  loading?: boolean;
  testId?: string;
  cancelTestId?: string;
  modalTestId?: string;
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading || internalLoading;
  const confirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setInternalLoading(false);
    }
  };
  return (
    <div data-testid={modalTestId}>
      <Modal
        isOpen={isOpen}
        modal={false}
        onClose={onClose}
        title={title}
        loading={isLoading}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              data-testid={cancelTestId}
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={confirm}
              loading={isLoading}
              data-testid={testId}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        <ModalBody>{children}</ModalBody>
      </Modal>
    </div>
  );
}

function ModalConfirmText({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmVariant = "default",
  confirmWord,
  loading = false,
  testId,
  modalTestId,
  cancelTestId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "default" | "danger";
  confirmWord: string;
  loading?: boolean;
  testId?: string;
  modalTestId?: string;
  cancelTestId?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const valid = inputValue === confirmWord && !loading;
  return (
    <div data-testid={modalTestId}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        loading={loading}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              data-testid={cancelTestId}
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={onConfirm}
              disabled={!valid}
              data-testid={testId}
            >
              {confirmLabel}
            </Button>
          </>
        }
      >
        <ModalBody>
          <p>{message}</p>
          <label className="mt-4 block text-sm" htmlFor="confirm-text-input">
            Type <strong>{confirmWord}</strong> to confirm
          </label>
          <input
            id="confirm-text-input"
            className="mt-2 min-h-12 w-full rounded-lg border bg-background px-3"
            placeholder={`Type "${confirmWord}" to confirm`}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={loading}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}

export function Modal(props: ModalProps) {
  return <ModalRoot {...props} />;
}

export namespace Modal {
  export const Header = ModalHeader;
  export const Body = ModalBody;
  export const Footer = ModalFooter;
  export const ConfirmDialog = ModalConfirmDialog;
  export const ConfirmText = ModalConfirmText;
}

export { ModalBody, ModalFooter, ModalHeader, ModalConfirmDialog, ModalConfirmText };
