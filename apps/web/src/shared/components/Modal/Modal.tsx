"use client";

import {
  useEffect,
  useRef,
  useEffectEvent,
  useState,
  type ReactNode,
  useSyncExternalStore,
  createContext,
  useContext,
  Children,
  type ReactElement,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { LazyMotion, m, domAnimation, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../Button/Button";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./modal.module.css";

interface ModalTabsContextType {
  activeTab: string;
  onActiveTabChange: (id: string) => void;
}

const ModalTabsContext = createContext<ModalTabsContextType | undefined>(undefined);

function useModalTabs() {
  const context = useContext(ModalTabsContext);
  if (!context) {
    throw new Error("useModalTabs must be used within a Modal with multiTab enabled");
  }
  return context;
}

function getModalPortalRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.body;
}

function subscribeModalPortalRoot(): () => void {
  return () => {};
}

const JUSTIFY_MAP = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
  "flex-end": "flex-end",
  "space-between": "space-between",
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  width?: string | number;
  hideFooter?: boolean;
  footerAlignment?: "left" | "right" | "center" | "space-between";
  footerBorder?: boolean;
  loading?: boolean;
  multiTab?: boolean;
  requireReview?: boolean;
  activeTab?: string;
  onActiveTabChange?: (id: string) => void;
  defaultActiveTab?: string;
  reviewTabId?: string;
  saveFormId?: string;
  saving?: boolean;
  saveLabel?: ReactNode;
  savingLabel?: ReactNode;
  reviewLabel?: ReactNode;
  cancelLabel?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  width,
  hideFooter,
  footerAlignment = "right",
  footerBorder: _footerBorder = false,
  loading,
  multiTab = false,
  requireReview = false,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  defaultActiveTab = "en",
  reviewTabId = "review",
  saveFormId,
  saving = false,
  saveLabel,
  savingLabel,
  reviewLabel,
  cancelLabel,
}: ModalProps) {
  const portalRoot = useSyncExternalStore(subscribeModalPortalRoot, getModalPortalRoot, () => null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultActiveTab);

  const { t } = useTranslation();

  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;

  const handleCloseEvent = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseEvent();
    };
    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  const justifyContent = JUSTIFY_MAP[footerAlignment as keyof typeof JUSTIFY_MAP] || "flex-end";

  const customWidth = width ? (typeof width === "number" ? `${width}px` : width) : undefined;

  const tabContextValue = useMemo(
    () => ({
      activeTab,
      onActiveTabChange: (id: string) => {
        if (onActiveTabChange) {
          onActiveTabChange(id);
        } else {
          setUncontrolledActiveTab(id);
        }
      },
    }),
    [activeTab, onActiveTabChange],
  );

  if (!portalRoot) return null;

  return createPortal(
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <div className={styles.overlay}>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.backdrop}
              onClick={loading ? undefined : onClose}
            />
            <m.div
              ref={contentRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`${styles.content} ${customWidth ? undefined : styles[`size-${size}`]}`}
              onClick={(e) => e.stopPropagation()}
              style={customWidth ? { width: customWidth } : undefined}
            >
              {title && (
                <header className={styles.header}>
                  <h2 id="modal-title" className={styles.title}>
                    {title}
                  </h2>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close dialog"
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                </header>
              )}
              {children && (
                <div className={styles.body}>
                  {multiTab && tabContextValue ? (
                    <ModalTabsContext.Provider value={tabContextValue}>
                      {children}
                    </ModalTabsContext.Provider>
                  ) : (
                    children
                  )}
                </div>
              )}
              {!hideFooter && (
                <footer
                  className={styles.footer}
                  style={{
                    justifyContent,
                  }}
                >
                  {requireReview ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={loading || saving}
                      >
                        {cancelLabel ?? t("common.cancel", "Cancel")}
                      </Button>
                      {activeTab === reviewTabId ? (
                        <Button type="submit" form={saveFormId} variant="primary" loading={saving}>
                          {saving
                            ? (savingLabel ?? t("admin.permissions.saving", "Saving…"))
                            : (saveLabel ?? t("common.save", "Save"))}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="primary"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onActiveTabChange) {
                              onActiveTabChange(reviewTabId);
                            } else {
                              setUncontrolledActiveTab(reviewTabId);
                            }
                          }}
                        >
                          {reviewLabel ?? t("admin.modal.reviewTab", "Review")}
                        </Button>
                      )}
                    </>
                  ) : (
                    footer
                  )}
                </footer>
              )}
              {loading && <div className={styles.loadingOverlay} />}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </LazyMotion>,
    portalRoot!,
  );
}

// Tab compound components
interface ModalTabItemProps {
  id: string;
  children?: ReactNode;
  disabled?: boolean;
}

function ModalTabItem({ id: _id, children: _children }: ModalTabItemProps) {
  return null;
}

interface ModalTabsProps {
  children?: ReactNode;
}

function ModalTabs({ children }: ModalTabsProps) {
  const { activeTab, onActiveTabChange } = useModalTabs();

  const tabs = Children.toArray(children).reduce<ModalTabItemProps[]>((acc, child) => {
    if ((child as ReactElement)?.type === ModalTabItem) {
      acc.push((child as ReactElement<ModalTabItemProps>)?.props);
    }
    return acc;
  }, []);

  return (
    <div className={styles.tabBar} role="tablist">
      {tabs.map((tab: ModalTabItemProps) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          type="button"
          className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
          onClick={() => onActiveTabChange(tab.id)}
          disabled={tab.disabled}
        >
          {tab.children}
        </button>
      ))}
    </div>
  );
}

interface ModalContentItemProps {
  id: string;
  children?: ReactNode;
}

function ModalContentItem({ id: _id, children: _children }: ModalContentItemProps) {
  return null;
}

interface ModalContentProps {
  children?: ReactNode;
}

function ModalContent({ children }: ModalContentProps) {
  const { activeTab } = useModalTabs();

  const activeContent = Children.toArray(children).find((child) => {
    const element = child as ReactElement<ModalContentItemProps>;
    return element?.type === ModalContentItem && element?.props?.id === activeTab;
  }) as ReactElement<ModalContentItemProps> | undefined;

  return <>{activeContent?.props?.children}</>;
}

// Compound components for advanced use cases
interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  loading?: boolean;
}

export function ModalHeader({ children, onClose, loading }: ModalHeaderProps) {
  return (
    <header className={styles.header}>
      <h2 id="modal-title" className={styles.title}>
        {children}
      </h2>
      {onClose && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
          disabled={loading}
        >
          <X size={20} />
        </button>
      )}
    </header>
  );
}

interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  return <div className={styles.body}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  alignment?: "left" | "right" | "center" | "space-between";
  border?: boolean;
}

export function ModalFooter({ children, alignment = "right", border = true }: ModalFooterProps) {
  const justifyContent = JUSTIFY_MAP[alignment as keyof typeof JUSTIFY_MAP] || "flex-end";

  return (
    <footer
      className={styles.footer}
      style={{
        justifyContent,
        borderTop: border ? `1px solid var(--border-subtle)` : "none",
      }}
    >
      {children}
    </footer>
  );
}

interface ModalConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  confirmLabel: string;
  confirmVariant?: "default" | "danger";
  children?: ReactNode;
  loading?: boolean;
  testId?: string;
  cancelTestId?: string;
  modalTestId?: string;
}

export function ModalConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  confirmVariant = "default",
  children,
  loading = false,
  testId,
  cancelTestId,
  modalTestId,
}: ModalConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <div data-testid={modalTestId}>
      <Modal isOpen={isOpen} onClose={onClose} title={title} loading={loading}>
        {children && <ModalBody>{children}</ModalBody>}
        <ModalFooter alignment="right">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            data-testid={cancelTestId}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant={confirmVariant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            data-testid={testId}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

interface ModalConfirmTextProps {
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
}

export function ModalConfirmText({
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
}: ModalConfirmTextProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const isConfirmDisabled = inputValue !== confirmWord || loading;

  return (
    <div data-testid={modalTestId}>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} loading={loading}>
        <ModalBody>
          <p style={{ marginBottom: "1rem", color: "var(--content-default)" }}>{message}</p>
          <p
            style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--content-muted)" }}
          >
            {t("modal.typeLabel", "Type")} <strong>{confirmWord}</strong>{" "}
            {t("modal.toConfirmLabel", "to confirm")}
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("modal.confirmPlaceholder", {
              defaultValue: `Type "${confirmWord}" to confirm`,
              confirmWord,
            })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
              color: "var(--content-default)",
              backgroundColor: "var(--surface-default)",
            }}
            disabled={loading}
          />
        </ModalBody>
        <ModalFooter alignment="right">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            data-testid={cancelTestId}
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant={confirmVariant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            data-testid={testId}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Attach compound components to Modal
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.ConfirmDialog = ModalConfirmDialog;
Modal.ConfirmText = ModalConfirmText;
Modal.Tabs = ModalTabs;
Modal.TabItem = ModalTabItem;
Modal.Content = ModalContent;
Modal.ContentItem = ModalContentItem;
