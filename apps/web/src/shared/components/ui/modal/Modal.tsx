"use client";

import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";
import { z } from "zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export type ModalWidthVariant = "wide" | "standard" | "narrow" | "auto";
export type ModalHeightVariant = "long" | "standard" | "short" | "auto";
export interface ModalProps {
  isOpen: boolean; onClose: () => void; title?: string; children?: ReactNode; footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl"; width?: ModalWidthVariant | string | number; height?: ModalHeightVariant | string | number;
  hideFooter?: boolean; footerAlignment?: "left" | "right" | "center" | "space-between"; footerBorder?: boolean; loading?: boolean;
  multiTab?: boolean; requireReview?: boolean; activeTab?: string; onActiveTabChange?: (id: string) => void; defaultActiveTab?: string;
  reviewTabId?: string; errorTabs?: string[]; saveFormId?: string; saving?: boolean; saveLabel?: ReactNode; savingLabel?: ReactNode; reviewLabel?: ReactNode; cancelLabel?: ReactNode;
}

const widthClasses = { wide: "sm:max-w-3xl", standard: "sm:max-w-xl", narrow: "sm:max-w-md", auto: "sm:max-w-lg" } satisfies Record<ModalWidthVariant, string>;
type ModalTabProps = { id: string; children?: ReactNode; disabled?: boolean; hasError?: boolean };
type ModalContentProps = { id: string; children?: ReactNode };
const modalIdSchema = z.object({ id: z.string() });
const modalWidthSchema = z.enum(["wide", "standard", "narrow", "auto"]);
function isModalTab(child: ReactNode): child is ReactElement<ModalTabProps> { return isValidElement<ModalTabProps>(child) && modalIdSchema.safeParse(child.props).success; }
function isModalContentItem(child: ReactNode): child is ReactElement<ModalContentProps> { return isValidElement<ModalContentProps>(child) && modalIdSchema.safeParse(child.props).success; }
function isModalWidth(value: string): value is ModalWidthVariant { return modalWidthSchema.safeParse(value).success; }

function ModalBody({ children }: { children: ReactNode }) { return <div className="max-h-[min(70vh,48rem)] overflow-y-auto py-2">{children}</div>; }
function ModalHeader({ children }: { children: ReactNode }) { return <DialogHeader><DialogTitle>{children}</DialogTitle></DialogHeader>; }
function ModalFooter({ children, alignment = "right", border = true }: { children: ReactNode; alignment?: "left" | "right" | "center" | "space-between"; border?: boolean }) {
  const justifyContent = alignment === "space-between" ? "space-between" : alignment === "left" ? "flex-start" : alignment;
  return <DialogFooter className={border ? undefined : "border-0"} style={{ justifyContent }}>{children}</DialogFooter>;
}

function ModalTabItem(_props: ModalTabProps) { return null; }
function ModalTabs({ children, errorTabs = [] }: { children?: ReactNode; errorTabs?: string[] }) {
  const tabs = Children.toArray(children).filter(isModalTab);
  const errorTabSet = new Set(errorTabs);
  return <TabsList className="w-full justify-start overflow-x-auto">{tabs.map((tab) => {
    const props = tab.props;
    return <TabsTrigger key={props.id} value={props.id} disabled={props.disabled} aria-invalid={props.hasError || errorTabSet.has(props.id) || undefined}>{props.children}</TabsTrigger>;
  })}</TabsList>;
}
function ModalContentItem(_props: ModalContentProps) { return null; }
function ModalContent({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter(isModalContentItem);
  return <>{items.map((item) => <TabsContent key={item.props.id} value={item.props.id} forceMount>{item.props.children}</TabsContent>)}</>;
}

function ModalRoot({ isOpen, onClose, title, children, footer, size = "md", width = "standard", hideFooter, footerAlignment = "right", footerBorder = true, loading, multiTab = false, requireReview = false, activeTab: controlledActiveTab, onActiveTabChange, defaultActiveTab = "en", reviewTabId = "review", saveFormId, saving = false, saveLabel, savingLabel, reviewLabel, cancelLabel }: ModalProps) {
  const { t } = useTranslation();
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultActiveTab);
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;
  const setActiveTab = (value: string) => { onActiveTabChange?.(value); if (!onActiveTabChange) setUncontrolledActiveTab(value); };
  const content = multiTab ? <Tabs value={activeTab} onValueChange={setActiveTab}>{children}</Tabs> : children;
  const parsedWidth = z.union([modalWidthSchema, z.string()]).safeParse(width);
  const maxWidth = parsedWidth.success && isModalWidth(parsedWidth.data) ? widthClasses[parsedWidth.data] : undefined;
  return <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
    <DialogContent className={maxWidth} data-size={size}>
      {title && <ModalHeader>{title}</ModalHeader>}
      <DialogDescription className="sr-only">Dialog content</DialogDescription>
      {content}
      {!hideFooter && (requireReview ? <ModalFooter alignment={footerAlignment} border={footerBorder}>
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading || saving}>{cancelLabel ?? t("common.cancel", "Cancel")}</Button>
        {activeTab === reviewTabId ? <Button type="submit" form={saveFormId} variant="primary" loading={saving}>{saving ? (savingLabel ?? t("admin.access.saving", "Saving…")) : (saveLabel ?? t("common.save", "Save"))}</Button> : <Button type="button" variant="primary" onClick={() => setActiveTab(reviewTabId)}>{reviewLabel ?? t("admin.modal.reviewTab", "Review")}</Button>}
      </ModalFooter> : footer ? <ModalFooter alignment={footerAlignment} border={footerBorder}>{footer}</ModalFooter> : null)}
    </DialogContent>
  </Dialog>;
}

function ModalConfirmDialog({ isOpen, onClose, onConfirm, title, confirmLabel = "Confirm", confirmVariant = "default", children, loading = false, testId, cancelTestId, modalTestId }: { isOpen: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; confirmLabel?: string; confirmVariant?: "default" | "danger"; children?: ReactNode; loading?: boolean; testId?: string; cancelTestId?: string; modalTestId?: string }) {
  const [internalLoading, setInternalLoading] = useState(false); const isLoading = loading || internalLoading;
  const confirm = async () => { setInternalLoading(true); try { await onConfirm(); onClose(); } finally { setInternalLoading(false); } };
  return <div data-testid={modalTestId}><Modal isOpen={isOpen} onClose={onClose} title={title} loading={isLoading} footer={<><Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} data-testid={cancelTestId}>Cancel</Button><Button variant={confirmVariant === "danger" ? "danger" : "primary"} size="sm" onClick={confirm} loading={isLoading} data-testid={testId}>{confirmLabel}</Button></>}><ModalBody>{children}</ModalBody></Modal></div>;
}

function ModalConfirmText({ isOpen, onClose, onConfirm, title, message, confirmLabel, confirmVariant = "default", confirmWord, loading = false, testId, modalTestId, cancelTestId }: { isOpen: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; message: string; confirmLabel: string; confirmVariant?: "default" | "danger"; confirmWord: string; loading?: boolean; testId?: string; modalTestId?: string; cancelTestId?: string }) {
  const [inputValue, setInputValue] = useState(""); const valid = inputValue === confirmWord && !loading;
  return <div data-testid={modalTestId}><Modal isOpen={isOpen} onClose={onClose} title={title} loading={loading} footer={<><Button variant="outline" size="sm" onClick={onClose} disabled={loading} data-testid={cancelTestId}>Cancel</Button><Button variant={confirmVariant === "danger" ? "danger" : "primary"} size="sm" onClick={onConfirm} disabled={!valid} data-testid={testId}>{confirmLabel}</Button></>}><ModalBody><p>{message}</p><label className="mt-4 block text-sm" htmlFor="confirm-text-input">Type <strong>{confirmWord}</strong> to confirm</label><input id="confirm-text-input" className="mt-2 min-h-12 w-full rounded-lg border bg-background px-3" placeholder={`Type "${confirmWord}" to confirm`} value={inputValue} onChange={(event) => setInputValue(event.target.value)} disabled={loading} /></ModalBody></Modal></div>;
}

export function Modal(props: ModalProps) { return <ModalRoot {...props} />; }

export namespace Modal {
  export const Header = ModalHeader;
  export const Body = ModalBody;
  export const Footer = ModalFooter;
  export const ConfirmDialog = ModalConfirmDialog;
  export const ConfirmText = ModalConfirmText;
  export const Tabs = ModalTabs;
  export const TabItem = ModalTabItem;
  export const Content = ModalContent;
  export const ContentItem = ModalContentItem;
}

export { ModalBody, ModalFooter, ModalHeader, ModalConfirmDialog, ModalConfirmText };
