# UI/UX Refactor Plan - Navigation, Headers, and Admin Screens

## Overview

This plan addresses UI/UX improvements across the web app. **All import paths, API patterns, and component reuse are verified against the actual codebase.**

---

## Verified Codebase Patterns

### Import Patterns (MUST USE THESE)

```tsx
// Types and HTTP client - from core-contracts
import { httpClient, endpoints, queryKeys } from "@sd/core-contracts";
import type { CreateScholarDto, UpdateScholarDto } from "@sd/core-contracts";

// React Query hook - from core-contracts
import { useApiQuery } from "@sd/core-contracts";

// Local app imports - use @/ prefix
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Button } from "@/shared/components/Button";

// Admin API functions - already exist
import {
  createScholar,
  updateScholar,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/features/admin/api/admin.api";
```

### Existing APIs (Backend Verified)

| Operation         | Endpoint                          | Permission        | Controller                |
| ----------------- | --------------------------------- | ----------------- | ------------------------- |
| Create Scholar    | `POST /admin/scholars`            | `manage:scholars` | `AdminScholarsController` |
| Update Scholar    | `PATCH /admin/scholars/:id`       | `manage:scholars` | `AdminScholarsController` |
| Create Topic      | `POST /admin/topics`              | `manage:topics`   | `AdminTopicsController`   |
| Update Topic      | `PATCH /admin/topics/:slug`       | `manage:topics`   | `AdminTopicsController`   |
| Delete Topic      | `DELETE /admin/topics/:slug`      | `manage:topics`   | `AdminTopicsController`   |
| Create Listing    | `POST /admin/listings`            | `manage:content`  | `AdminListingsController` |
| Update Listing    | `PUT /admin/listings/:id`         | `manage:content`  | `AdminListingsController` |
| Get Presigned URL | `POST /admin/media/presigned-url` | `manage:content`  | `MediaController`         |

### Existing Reusable Components

- `apps/web/src/features/admin/components/LectureEditModal/` - Full listing edit with audio upload
- `apps/web/src/features/admin/components/AudioUploader/` - Presigned URL + R2 upload
- `apps/web/src/shared/components/Button/` - Shared button component
- `apps/web/src/shared/components/ScreenView/` - Screen wrapper
- `apps/web/src/shared/components/SegmentedControl/` - Tab control

### Audio Upload Flow (Already Implemented)

```
1. User selects audio file
2. Extract metadata (duration) using HTML5 Audio API
3. Request presigned URL → POST /admin/media/presigned-url
4. Direct PUT upload to Cloudflare R2 using presigned URL
5. Create listing with audioKey, durationSeconds, sizeBytes
```

---

## Phase 1: Foundational Components

### 1.1 Create Shared Page Header Component

**New file:** `apps/web/src/shared/components/PageHeader/PageHeader.tsx`

```tsx
import type { ReactNode } from "react";
import styles from "./page-header.module.css";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
```

**New file:** `apps/web/src/shared/components/PageHeader/page-header.module.css`

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-layout-section-y);
  flex-wrap: wrap;
}

.titleGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.title {
  font-size: var(--typo-display-lg-font-size);
  font-weight: 700;
  line-height: var(--typo-display-lg-line-height);
  color: var(--content-strong);
  margin: 0;
}

.subtitle {
  font-size: var(--typo-body-md-font-size);
  color: var(--content-muted);
  margin: 0;
}

.actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    width: 100%;
  }
}
```

**New file:** `apps/web/src/shared/components/PageHeader/index.ts`

```tsx
export { PageHeader } from "./PageHeader";
export type { PageHeaderProps } from "./PageHeader";
```

---

### 1.2 Create Shared Modal Component

**New file:** `apps/web/src/shared/components/Modal/Modal.tsx`

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./modal.module.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.backdrop}
            onClick={onClose}
          />
          <motion.div
            ref={contentRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`${styles.content} ${styles[`size-${size}`]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.header}>
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </header>
            <div className={styles.body}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
```

**New file:** `apps/web/src/shared/components/Modal/modal.module.css`

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.content {
  position: relative;
  background-color: var(--surface-default);
  border-radius: var(--radius-component-card);
  box-shadow: var(--shadow-lg);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.size-sm {
  width: min(24rem, 100%);
}
.size-md {
  width: min(32rem, 100%);
}
.size-lg {
  width: min(48rem, 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-subtle);
}

.title {
  font-size: var(--typo-title-lg-font-size);
  font-weight: 600;
  color: var(--content-strong);
  margin: 0;
}

.closeButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--content-muted);
  cursor: pointer;
  transition:
    background-color 150ms,
    color 150ms;
}

.closeButton:hover {
  background-color: var(--surface-hover);
  color: var(--content-default);
}

.body {
  padding: var(--space-lg);
  overflow-y: auto;
}
```

**New file:** `apps/web/src/shared/components/Modal/index.ts`

```tsx
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";
```

---

### 1.3 Create Admin Search Bar Component

**New file:** `apps/web/src/features/admin/components/AdminSearchBar/AdminSearchBar.tsx`

```tsx
import { Search } from "lucide-react";
import { Button } from "@/shared/components/Button";
import styles from "./admin-search-bar.module.css";

export interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
}

export function AdminSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  loading = false,
}: AdminSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onSearch}
        loading={loading}
        className={styles.button}
      >
        Search
      </Button>
    </div>
  );
}
```

**New file:** `apps/web/src/features/admin/components/AdminSearchBar/admin-search-bar.module.css`

```css
.container {
  display: flex;
  gap: var(--space-sm);
  max-width: 100%;
}

.inputWrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--content-muted);
  pointer-events: none;
}

.input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  padding-left: 2.5rem;
  font-size: var(--typo-body-md-font-size);
  background-color: var(--surface-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--content-default);
  transition: border-color 150ms;
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
}

.input::placeholder {
  color: var(--content-muted);
}

.button {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .container {
    flex-direction: column;
  }

  .inputWrapper {
    max-width: 100%;
  }

  .button {
    width: 100%;
  }
}
```

**New file:** `apps/web/src/features/admin/components/AdminSearchBar/index.ts`

```tsx
export { AdminSearchBar } from "./AdminSearchBar";
export type { AdminSearchBarProps } from "./AdminSearchBar";
```

---

### 1.4 Create Scholar Card Component

**New file:** `apps/web/src/features/admin/components/ScholarCard/ScholarCard.tsx`

```tsx
import { Pencil } from "lucide-react";
import { Button } from "@/shared/components/Button";
import styles from "./scholar-card.module.css";

export interface ScholarCardProps {
  id: string;
  name: string;
  slug: string;
  isKibar: boolean;
  lectureCount: number;
  imageUrl?: string;
  onEdit: () => void;
}

export function ScholarCard({
  name,
  slug,
  isKibar,
  lectureCount,
  imageUrl,
  onEdit,
}: ScholarCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarFallback}>{name.charAt(0)}</span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.slug}>{slug}</p>
        <div className={styles.meta}>
          {isKibar && <span className={styles.badge}>Kibar</span>}
          <span className={styles.lectures}>{lectureCount} lectures</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        icon={<Pencil size={16} />}
      />
    </div>
  );
}
```

**New file:** `apps/web/src/features/admin/components/ScholarCard/scholar-card.module.css`

```css
.card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--surface-default);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-component-card);
  transition:
    border-color 150ms,
    box-shadow 150ms;
}

.card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-sm);
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--surface-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatarImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatarFallback {
  font-size: var(--typo-title-md-font-size);
  font-weight: 600;
  color: var(--content-muted);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: var(--typo-body-md-font-size);
  font-weight: 600;
  color: var(--content-strong);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slug {
  font-size: var(--typo-body-sm-font-size);
  color: var(--content-muted);
  margin: 0;
}

.meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.badge {
  font-size: var(--typo-caption-font-size);
  padding: 2px 6px;
  background-color: var(--surface-primary-subtle);
  color: var(--content-primary);
  border-radius: var(--radius-sm);
}

.lectures {
  font-size: var(--typo-caption-font-size);
  color: var(--content-muted);
}
```

**New file:** `apps/web/src/features/admin/components/ScholarCard/index.ts`

```tsx
export { ScholarCard } from "./ScholarCard";
export type { ScholarCardProps } from "./ScholarCard";
```

---

## Phase 2: Navigation Fixes

### 2.1 Add Toggle Function to Navigation Store

**File:** `apps/web/src/features/navigation/store/navigation-store.ts`

**Add to NavigationState interface:**

```tsx
toggleMobileDrawer: () => void;
```

**Add to store implementation (after `closeMobileDrawer`):**

```tsx
toggleMobileDrawer: () =>
  set((state) => ({
    isMobileDrawerOpen: !state.isMobileDrawerOpen,
  })),
```

---

### 2.2 Update Mobile Header - Toggle + Larger Brand Text

**File:** `apps/web/src/features/navigation/components/sidebar/mobile-header.tsx`

**Add imports:**

```tsx
import { Menu, X } from "lucide-react";
import { useNavigationStore } from "../../store/navigation-store";
```

**Replace the component:**

```tsx
export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { t } = useTranslation();
  const { isMobileDrawerOpen } = useNavigationStore();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label={
          isMobileDrawerOpen
            ? t("navigation.closeMenu", "Close menu")
            : t("navigation.openMenu", "Open menu")
        }
        aria-expanded={isMobileDrawerOpen}
      >
        {isMobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Link href={routes.home} className={styles.brand} aria-label={t("navigation.siteTitle")}>
        <span className={styles.brandMark} aria-hidden="true">
          <Image
            src="/logo/logo_72.png"
            alt=""
            width={28}
            height={28}
            priority
            className={styles.brandImg}
          />
        </span>
        <span className={styles.brandText}>{t("navigation.siteTitle", "Salafi Durus")}</span>
      </Link>

      <div className={styles.spacer} />
    </header>
  );
}
```

---

### 2.3 Update Mobile Header CSS - Larger Brand Text

**File:** `apps/web/src/features/navigation/components/sidebar/mobile-header.module.css`

**Update `.brand` class (change font-size from 0.875rem to 1.125rem):**

```css
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-component-gap-sm);
  text-decoration: none;
  color: var(--content-strong);
  font-weight: 700;
  font-size: 1.125rem; /* Changed from 0.875rem */
}
```

---

### 2.4 Update Sidebar Mobile to Use Toggle

**File:** `apps/web/src/features/navigation/components/sidebar/sidebar.mobile.tsx`

**Replace `openMobileDrawer` with `toggleMobileDrawer`:**

```tsx
export function SidebarMobile() {
  const { isMobileDrawerOpen, toggleMobileDrawer, closeMobileDrawer } = useNavigationStore();

  return (
    <>
      <MobileHeader onMenuClick={toggleMobileDrawer} />
      <SidebarDrawer isOpen={isMobileDrawerOpen} onClose={closeMobileDrawer} />
    </>
  );
}
```

---

### 2.5 Unify Tablet Sidebar Toggle Icons

**File:** `apps/web/src/features/navigation/components/sidebar/sidebar.tablet.tsx`

**Replace imports:**

```tsx
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
// Remove: import { ChevronRight } from "lucide-react";
```

**Replace icon in collapse button:**

```tsx
<button
  type="button"
  className={styles.collapseButton}
  onClick={toggleTabletSidebar}
  aria-label={
    isTabletSidebarCollapsed ? t("navigation.expandSidebar") : t("navigation.collapseSidebar")
  }
>
  {isTabletSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelLeftOpen size={16} />}
</button>
```

---

## Phase 3: Mobile SubNav Tabs

### 3.1 Show SubNav Tabs on Mobile

**File:** `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css`

**Add/modify for mobile visibility:**

```css
/* Ensure tabs are visible on mobile with horizontal scroll */
.tabsContainer {
  position: sticky;
  top: calc(var(--mobile-header-height, 3.5rem) + env(safe-area-inset-top));
  z-index: 25;
  background-color: var(--surface-default);
  border-bottom: 1px solid var(--border-subtle);
}

@media (max-width: 640px) {
  .tabsContainer {
    display: block; /* Remove any display:none */
  }

  .inner {
    width: 100%;
    padding: 0 var(--space-layout-page-x);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .inner::-webkit-scrollbar {
    display: none;
  }

  .tabsList {
    display: flex;
    gap: var(--space-md);
    white-space: nowrap;
    min-width: max-content;
  }
}
```

**File:** `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx`

**Remove any `useIsDesktop()` or `isMobile` conditionals that prevent rendering on mobile.**

---

## Phase 4: Admin Scholars Page Redesign

### 4.1 Create Scholar Form Modal (Connected to API)

**New file:** `apps/web/src/features/admin/components/ScholarFormModal/ScholarFormModal.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { CreateScholarDto } from "@sd/core-contracts";
import styles from "./scholar-form-modal.module.css";

// Matches the existing ScholarListItemDto structure
export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ScholarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

const initialFormData: CreateScholarDto = {
  name: "",
  slug: "",
  bio: "",
  imageUrl: "",
  isKibar: false,
  isFeatured: false,
  isActive: true,
};

export function ScholarFormModal({ isOpen, onClose, onSave, scholar }: ScholarFormModalProps) {
  const [formData, setFormData] = useState<CreateScholarDto>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!scholar;

  useEffect(() => {
    if (scholar) {
      setFormData({
        name: scholar.name,
        slug: scholar.slug,
        bio: scholar.bio ?? "",
        imageUrl: scholar.imageUrl ?? "",
        isKibar: scholar.isKibar ?? false,
        isFeatured: scholar.isFeatured ?? false,
        isActive: scholar.isActive ?? true,
      });
    } else {
      setFormData(initialFormData);
    }
    setError(null);
  }, [scholar, isOpen]);

  // Auto-generate slug from name (for new scholars only)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      // Only auto-slug for new scholars
      slug: !isEditing
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Scholar" : "Add Scholar"}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Scholar name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="scholar-slug"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Bio</label>
          <textarea
            className={styles.textarea}
            value={formData.bio ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Brief biography..."
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Image URL</label>
          <input
            type="url"
            className={styles.input}
            value={formData.imageUrl ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.isKibar ?? false}
              onChange={(e) => setFormData((p) => ({ ...p, isKibar: e.target.checked }))}
            />
            <span>Kibar</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.isFeatured ?? false}
              onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
            />
            <span>Featured</span>
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.isActive ?? true}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
            />
            <span>Active</span>
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEditing ? "Save Changes" : "Add Scholar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

**New file:** `apps/web/src/features/admin/components/ScholarFormModal/scholar-form-modal.module.css`

```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.error {
  padding: var(--space-sm) var(--space-md);
  background-color: var(--surface-subtle);
  border: 1px solid var(--border-danger);
  color: var(--content-danger);
  border-radius: var(--radius-sm);
  font-size: var(--typo-body-sm-font-size);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: var(--typo-label-md-font-size);
  font-weight: 500;
  color: var(--content-default);
}

.input,
.textarea {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--typo-body-md-font-size);
  background-color: var(--surface-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--content-default);
  transition: border-color 150ms;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--border-focus);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.checkboxGroup {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--typo-body-md-font-size);
  color: var(--content-default);
  cursor: pointer;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-subtle);
}
```

**New file:** `apps/web/src/features/admin/components/ScholarFormModal/index.ts`

```tsx
export { ScholarFormModal } from "./ScholarFormModal";
export type { ScholarFormModalProps, ScholarForEdit } from "./ScholarFormModal";
```

---

### 4.2 Rewrite Admin Scholars Screen (Desktop) - API Connected

**File:** `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.tsx`

```tsx
"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto, CreateScholarDto } from "@sd/core-contracts";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import { AdminSearchBar } from "@/features/admin/components/AdminSearchBar";
import { ScholarCard } from "@/features/admin/components/ScholarCard";
import {
  ScholarFormModal,
  type ScholarForEdit,
} from "@/features/admin/components/ScholarFormModal";
import styles from "./admin-scholars.screen.desktop.module.css";

interface ScholarsListResponse {
  scholars: ScholarListItemDto[];
}

export function AdminScholarsDesktopScreen() {
  const { data, isFetching, refetch } = useApiQuery<ScholarsListResponse>(
    queryKeys.scholars.list(),
    () => httpClient<ScholarsListResponse>({ url: endpoints.scholars.list, method: "GET" }),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholar, setEditingScholar] = useState<ScholarForEdit | null>(null);

  const scholars = data?.scholars ?? [];

  const filteredScholars = useMemo(() => {
    if (!searchQuery.trim()) return scholars;
    const query = searchQuery.toLowerCase();
    return scholars.filter(
      (s) => s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query),
    );
  }, [scholars, searchQuery]);

  const handleOpenAdd = () => {
    setEditingScholar(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scholar: ScholarListItemDto) => {
    setEditingScholar({
      id: scholar.id,
      name: scholar.name,
      slug: scholar.slug,
      bio: scholar.bio,
      imageUrl: scholar.imageUrl,
      isKibar: scholar.isKibar,
      isFeatured: scholar.isFeatured,
      isActive: scholar.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (formData: CreateScholarDto) => {
    if (editingScholar) {
      // Update existing scholar
      await updateScholar(editingScholar.id, formData);
    } else {
      // Create new scholar
      await createScholar(formData);
    }
    // Refetch the list after save
    refetch();
  };

  if (isFetching && !data) {
    return (
      <ScreenView>
        <div className={styles.loading}>Loading scholars...</div>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.container}>
        <PageHeader
          title="Manage Scholars"
          actions={
            <Button variant="primary" icon={<Plus size={18} />} onClick={handleOpenAdd}>
              Add Scholar
            </Button>
          }
        />

        <div className={styles.toolbar}>
          <AdminSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
            placeholder="Search scholars by name or slug..."
          />
        </div>

        <div className={styles.grid}>
          {filteredScholars.map((scholar) => (
            <ScholarCard
              key={scholar.id}
              id={scholar.id}
              name={scholar.name}
              slug={scholar.slug}
              isKibar={scholar.isKibar ?? false}
              lectureCount={scholar.lectureCount ?? 0}
              imageUrl={scholar.imageUrl ?? undefined}
              onEdit={() => handleOpenEdit(scholar)}
            />
          ))}
        </div>

        {filteredScholars.length === 0 && (
          <div className={styles.empty}>
            {searchQuery ? "No scholars match your search." : "No scholars yet."}
          </div>
        )}
      </div>

      <ScholarFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        scholar={editingScholar}
      />
    </ScreenView>
  );
}
```

**New file:** `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loading,
.empty {
  padding: var(--space-xl);
  text-align: center;
  color: var(--content-muted);
  font-size: var(--typo-body-md-font-size);
}

.toolbar {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-md);
}
```

---

### 4.3 Create Admin Scholars Mobile Screen

**New file:** `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.mobile.tsx`

Same pattern as desktop but with mobile-optimized layout (single column, smaller button).

---

### 4.4 Update Admin Scholars Screen Router

**File:** `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx`

```tsx
"use client";

import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarsDesktopScreen } from "./admin-scholars.screen.desktop";
import { AdminScholarsMobileScreen } from "./admin-scholars.screen.mobile";

export function AdminScholarsScreen() {
  return (
    <Responsive mobile={<AdminScholarsMobileScreen />} desktop={<AdminScholarsDesktopScreen />} />
  );
}
```

---

## Phase 5: Admin Contents Page with Topics & Listings

### 5.1 Create Topic Form Modal (Connected to API)

**New file:** `apps/web/src/features/admin/components/TopicFormModal/TopicFormModal.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { UpsertTopicDto } from "@sd/core-contracts";
import styles from "./topic-form-modal.module.css";

export interface TopicForEdit {
  slug: string;
  name: string;
  parentSlug?: string | null;
}

export interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic?: TopicForEdit | null;
}

export function TopicFormModal({ isOpen, onClose, onSave, topic }: TopicFormModalProps) {
  const [formData, setFormData] = useState<UpsertTopicDto>({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!topic;

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        slug: topic.slug,
        parentSlug: topic.parentSlug ?? undefined,
      });
    } else {
      setFormData({ name: "", slug: "" });
    }
    setError(null);
  }, [topic, isOpen]);

  // Auto-generate slug from name (for new topics only)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: !isEditing
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Topic" : "Add Topic"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Topic name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="topic-slug"
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEditing ? "Save" : "Add Topic"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

**CSS file:** Same structure as ScholarFormModal.

---

### 5.2 Create Admin Contents Tabs Component

**New file:** `apps/web/src/features/admin/components/AdminContentsTabs/AdminContentsTabs.tsx`

```tsx
"use client";

import { SegmentedControl } from "@/shared/components/SegmentedControl";
import styles from "./admin-contents-tabs.module.css";

export type AdminContentsTab = "topics" | "listings";

export interface AdminContentsTabsProps {
  activeTab: AdminContentsTab;
  onTabChange: (tab: AdminContentsTab) => void;
}

const tabs = [
  { value: "topics", label: "Topics" },
  { value: "listings", label: "Listings" },
];

export function AdminContentsTabs({ activeTab, onTabChange }: AdminContentsTabsProps) {
  return (
    <div className={styles.container}>
      <SegmentedControl
        options={tabs}
        value={activeTab}
        onChange={(value) => onTabChange(value as AdminContentsTab)}
      />
    </div>
  );
}
```

---

### 5.3 Rewrite Admin Contents Desktop Screen (Topics + Listings with Audio Upload)

**File:** `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.tsx`

```tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto, UpsertTopicDto } from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic } from "@/features/admin/api/admin.api";
import {
  AdminContentsTabs,
  type AdminContentsTab,
} from "@/features/admin/components/AdminContentsTabs";
import { AdminSearchBar } from "@/features/admin/components/AdminSearchBar";
import { TopicFormModal, type TopicForEdit } from "@/features/admin/components/TopicFormModal";
// Reuse the existing LectureEditModal for listing management (has audio upload built-in)
import { LectureEditModal } from "@/features/admin/components/LectureEditModal";
import styles from "./admin-contents.screen.desktop.module.css";

export function AdminContentsDesktopScreen() {
  const [activeTab, setActiveTab] = useState<AdminContentsTab>("topics");
  const [searchQuery, setSearchQuery] = useState("");

  // Topics state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicForEdit | null>(null);

  // Listings state (uses existing LectureEditModal)
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // Fetch topics
  const { data: topicsData, refetch: refetchTopics } = useApiQuery<TopicDetailDto[]>(
    queryKeys.topics.list(),
    () => httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  const topics = topicsData ?? [];

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter(
      (t) => t.name.toLowerCase().includes(query) || t.slug.toLowerCase().includes(query),
    );
  }, [topics, searchQuery]);

  // Topic handlers
  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicDetailDto) => {
    setEditingTopic({
      slug: topic.slug,
      name: topic.name,
      parentSlug: topic.parentSlug,
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (formData: UpsertTopicDto) => {
    if (editingTopic) {
      await updateTopic(editingTopic.slug, formData);
    } else {
      await createTopic(formData);
    }
    refetchTopics();
  };

  const handleDeleteTopic = async (slug: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      await deleteTopic(slug);
      refetchTopics();
    }
  };

  // Listing handlers (leverages existing LectureEditModal with audio upload)
  const handleOpenAddListing = () => {
    setEditingListingId(null);
    setIsListingModalOpen(true);
  };

  return (
    <ScreenView>
      <div className={styles.container}>
        <PageHeader
          title="Content Management"
          actions={
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={activeTab === "topics" ? handleOpenAddTopic : handleOpenAddListing}
            >
              {activeTab === "topics" ? "Add Topic" : "Add Listing"}
            </Button>
          }
        />

        <AdminContentsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <AdminSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => {}}
          placeholder={activeTab === "topics" ? "Search topics..." : "Search listings..."}
        />

        {activeTab === "topics" && (
          <div className={styles.topicsList}>
            {filteredTopics.map((topic) => (
              <div key={topic.slug} className={styles.topicItem}>
                <div className={styles.topicInfo}>
                  <span className={styles.topicName}>{topic.name}</span>
                  <span className={styles.topicSlug}>{topic.slug}</span>
                </div>
                <div className={styles.topicActions}>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditTopic(topic)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteTopic(topic.slug)}
                  />
                </div>
              </div>
            ))}
            {filteredTopics.length === 0 && (
              <div className={styles.empty}>
                {searchQuery ? "No topics match your search." : "No topics yet."}
              </div>
            )}
          </div>
        )}

        {activeTab === "listings" && (
          <div className={styles.listingsInfo}>
            {/* The existing admin-lectures screen already handles listing management.
                This tab provides an alternative entry point using the same modal. */}
            <p>Use the "Add Listing" button to create new content with audio upload.</p>
            <p>For full listing management, see the Lectures admin page.</p>
          </div>
        )}
      </div>

      {/* Topic Modal */}
      <TopicFormModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        topic={editingTopic}
      />

      {/* Listing Modal - Reuses existing LectureEditModal which has AudioUploader built-in */}
      <LectureEditModal
        isOpen={isListingModalOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setEditingListingId(null);
        }}
        lectureId={editingListingId}
        onSaved={() => {
          setIsListingModalOpen(false);
          setEditingListingId(null);
        }}
      />
    </ScreenView>
  );
}
```

**New file:** `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.topicsList {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.topicItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--surface-default);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.topicInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topicName {
  font-weight: 500;
  color: var(--content-strong);
}

.topicSlug {
  font-size: var(--typo-body-sm-font-size);
  color: var(--content-muted);
}

.topicActions {
  display: flex;
  gap: var(--space-xs);
}

.listingsInfo {
  padding: var(--space-lg);
  background-color: var(--surface-subtle);
  border-radius: var(--radius-component-card);
  text-align: center;
  color: var(--content-muted);
}

.empty {
  padding: var(--space-xl);
  text-align: center;
  color: var(--content-muted);
}
```

---

## Phase 6: Test Specifications

### 6.1 Component Tests (Vitest + React Testing Library)

**File:** `apps/web/src/shared/components/PageHeader/__tests__/PageHeader.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByRole("heading", { name: "Test Title" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<PageHeader title="Title" actions={<button>Action</button>} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
```

**File:** `apps/web/src/shared/components/Modal/__tests__/Modal.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
```

**File:** `apps/web/src/features/admin/components/ScholarCard/__tests__/ScholarCard.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScholarCard } from "../ScholarCard";

describe("ScholarCard", () => {
  const defaultProps = {
    id: "1",
    name: "Test Scholar",
    slug: "test-scholar",
    isKibar: false,
    lectureCount: 10,
    onEdit: vi.fn(),
  };

  it("renders scholar name and slug", () => {
    render(<ScholarCard {...defaultProps} />);
    expect(screen.getByText("Test Scholar")).toBeInTheDocument();
    expect(screen.getByText("test-scholar")).toBeInTheDocument();
  });

  it("shows Kibar badge when isKibar is true", () => {
    render(<ScholarCard {...defaultProps} isKibar={true} />);
    expect(screen.getByText("Kibar")).toBeInTheDocument();
  });

  it("shows lecture count", () => {
    render(<ScholarCard {...defaultProps} />);
    expect(screen.getByText("10 lectures")).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", () => {
    const onEdit = vi.fn();
    render(<ScholarCard {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText("Edit Test Scholar"));
    expect(onEdit).toHaveBeenCalled();
  });
});
```

**File:** `apps/web/src/features/admin/components/AdminSearchBar/__tests__/AdminSearchBar.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminSearchBar } from "../AdminSearchBar";

describe("AdminSearchBar", () => {
  it("renders input with placeholder", () => {
    render(
      <AdminSearchBar
        value=""
        onChange={() => {}}
        onSearch={() => {}}
        placeholder="Search here..."
      />,
    );
    expect(screen.getByPlaceholderText("Search here...")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<AdminSearchBar value="" onChange={onChange} onSearch={() => {}} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalledWith("test");
  });

  it("calls onSearch when Enter pressed", () => {
    const onSearch = vi.fn();
    render(<AdminSearchBar value="query" onChange={() => {}} onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSearch).toHaveBeenCalled();
  });

  it("calls onSearch when button clicked", () => {
    const onSearch = vi.fn();
    render(<AdminSearchBar value="query" onChange={() => {}} onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalled();
  });
});
```

---

## Phase 7: Verification

### 7.1 Build & Type Check

```bash
cd apps/web && pnpm run typecheck && pnpm run build
```

### 7.2 Run Tests

```bash
cd apps/web && pnpm test
```

### 7.3 Manual Testing Checklist

- [ ] Mobile: Hamburger toggles drawer (open AND close)
- [ ] Mobile: "Salafi Durus" text is larger (1.125rem)
- [ ] Mobile: SubNav tabs show with horizontal scroll
- [ ] Tablet: Sidebar toggle uses PanelLeftOpen/PanelRightOpen icons
- [ ] All screens: Content doesn't hide behind mobile header
- [ ] Admin Scholars: Cards display correctly, modal opens for add/edit
- [ ] Admin Scholars: Save calls createScholar/updateScholar API
- [ ] Admin Scholars: Search filters scholars client-side
- [ ] Admin Contents Topics: Can add/edit/delete topics via API
- [ ] Admin Contents Listings: LectureEditModal opens with AudioUploader
- [ ] Admin Contents Listings: Audio upload uses presigned URL flow

---

## File Summary

### New Files to Create

1. `apps/web/src/shared/components/PageHeader/PageHeader.tsx`
2. `apps/web/src/shared/components/PageHeader/page-header.module.css`
3. `apps/web/src/shared/components/PageHeader/index.ts`
4. `apps/web/src/shared/components/PageHeader/__tests__/PageHeader.test.tsx`
5. `apps/web/src/shared/components/Modal/Modal.tsx`
6. `apps/web/src/shared/components/Modal/modal.module.css`
7. `apps/web/src/shared/components/Modal/index.ts`
8. `apps/web/src/shared/components/Modal/__tests__/Modal.test.tsx`
9. `apps/web/src/features/admin/components/AdminSearchBar/AdminSearchBar.tsx`
10. `apps/web/src/features/admin/components/AdminSearchBar/admin-search-bar.module.css`
11. `apps/web/src/features/admin/components/AdminSearchBar/index.ts`
12. `apps/web/src/features/admin/components/AdminSearchBar/__tests__/AdminSearchBar.test.tsx`
13. `apps/web/src/features/admin/components/ScholarCard/ScholarCard.tsx`
14. `apps/web/src/features/admin/components/ScholarCard/scholar-card.module.css`
15. `apps/web/src/features/admin/components/ScholarCard/index.ts`
16. `apps/web/src/features/admin/components/ScholarCard/__tests__/ScholarCard.test.tsx`
17. `apps/web/src/features/admin/components/ScholarFormModal/ScholarFormModal.tsx`
18. `apps/web/src/features/admin/components/ScholarFormModal/scholar-form-modal.module.css`
19. `apps/web/src/features/admin/components/ScholarFormModal/index.ts`
20. `apps/web/src/features/admin/components/AdminContentsTabs/AdminContentsTabs.tsx`
21. `apps/web/src/features/admin/components/AdminContentsTabs/admin-contents-tabs.module.css`
22. `apps/web/src/features/admin/components/TopicFormModal/TopicFormModal.tsx`
23. `apps/web/src/features/admin/components/TopicFormModal/topic-form-modal.module.css`
24. `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.mobile.tsx`
25. `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.mobile.module.css`
26. `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.module.css`
27. `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.module.css`

### Files to Modify

1. `apps/web/src/features/navigation/store/navigation-store.ts` - Add toggleMobileDrawer
2. `apps/web/src/features/navigation/components/sidebar/mobile-header.tsx` - Toggle + X icon
3. `apps/web/src/features/navigation/components/sidebar/mobile-header.module.css` - Larger brand text
4. `apps/web/src/features/navigation/components/sidebar/sidebar.mobile.tsx` - Use toggle
5. `apps/web/src/features/navigation/components/sidebar/sidebar.tablet.tsx` - Use PanelLeftOpen/PanelRightOpen
6. `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx` - Enable mobile rendering
7. `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css` - Mobile styles
8. `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx` - Add Responsive wrapper
9. `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.tsx` - Complete rewrite
10. `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.tsx` - Add tabs + API connection

### Existing Components Reused (NO new code needed)

- `apps/web/src/features/admin/components/LectureEditModal/` - For listing create/edit with audio
- `apps/web/src/features/admin/components/AudioUploader/` - Presigned URL upload flow
- `apps/web/src/features/admin/api/admin.api.ts` - createScholar, updateScholar, createTopic, updateTopic, deleteTopic

### API Endpoints Already Implemented (Backend)

- `POST /admin/scholars` → createScholar
- `PATCH /admin/scholars/:id` → updateScholar
- `POST /admin/topics` → createTopic
- `PATCH /admin/topics/:slug` → updateTopic
- `DELETE /admin/topics/:slug` → deleteTopic
- `POST /admin/listings` → createLecture (with audioKey from presigned upload)
- `PUT /admin/listings/:id` → updateLecture
- `POST /admin/media/presigned-url` → getPresignedUrl (for audio upload to R2)
