"use client";

import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  SUPPORTED_LOCALES,
  type AdminScholarListDto,
  type Locale,
} from "@sd/core-contracts";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  fetchUserTranslatorRoles,
  syncTranslatorRoles,
  type AdminTranslatorRolesListResponse,
} from "@/features/admin/api/admin.api";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal/Modal";
import { Toggle } from "@/shared/components/Toggle";

import styles from "./TranslatorRolesDialog.module.css";

export interface TranslatorRolesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslatorRolesChange?: () => void;
  userId: string;
  userName?: string;
}

interface State {
  translatorRoles: AdminTranslatorRolesListResponse | null;
  loading: boolean;
}

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: AdminTranslatorRolesListResponse }
  | { type: "LOAD_ERROR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true };
    case "LOAD_SUCCESS":
      return { ...state, translatorRoles: action.payload, loading: false };
    case "LOAD_ERROR":
      return { ...state, translatorRoles: { translatorRoles: [] }, loading: false };
    default:
      return state;
  }
}

const ALL_SCHOLARS_VALUE = "";

export function TranslatorRolesDialog({
  isOpen,
  onClose,
  onTranslatorRolesChange,
  userId,
  userName = userId,
}: TranslatorRolesDialogProps): ReactNode {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, { translatorRoles: null, loading: false });
  const [scopeSlug, setScopeSlug] = useState(ALL_SCHOLARS_VALUE);
  const [selectedLocales, setSelectedLocales] = useState<Set<Locale>>(new Set());
  const [canPublish, setCanPublish] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: scholarsData } = useApiQuery<AdminScholarListDto>(
    [...queryKeys.admin.scholars.all(), "picker"],
    () => httpClient<AdminScholarListDto>({ url: endpoints.admin.scholars.list, method: "GET" }),
    { enabled: isOpen },
  );
  const scholars = scholarsData?.items ?? [];

  const reload = useCallback(() => {
    dispatch({ type: "LOAD_START" });
    fetchUserTranslatorRoles(userId)
      .then((data) => dispatch({ type: "LOAD_SUCCESS", payload: data }))
      .catch(() => dispatch({ type: "LOAD_ERROR" }));
  }, [userId]);

  useEffect(() => {
    if (!isOpen) return;
    reload();
  }, [isOpen, reload]);

  const allRoles = useMemo(
    () => state.translatorRoles?.translatorRoles ?? [],
    [state.translatorRoles],
  );

  // Reset the form to the selected scope's current grants, but only when the
  // scope itself changes (or on the initial load) — not on every refetch, so
  // an in-flight reload (e.g. right after Save) can't clobber later edits to
  // a scope the admin has already switched to.
  const initializedForScopeRef = useRef<string | null>(null);
  useEffect(() => {
    if (!state.translatorRoles) return;
    if (initializedForScopeRef.current === scopeSlug) return;
    initializedForScopeRef.current = scopeSlug;

    const scopeRoles = allRoles.filter((r) =>
      scopeSlug === ALL_SCHOLARS_VALUE ? r.scholarSlug === null : r.scholarSlug === scopeSlug,
    );
    setSelectedLocales(new Set(scopeRoles.map((r) => r.locale)));
    setCanPublish(scopeRoles.some((r) => r.canPublish));
  }, [scopeSlug, state.translatorRoles, allRoles]);

  const handleToggleLocale = (locale: Locale) => {
    setSelectedLocales((prev) => {
      const next = new Set(prev);
      if (next.has(locale)) next.delete(locale);
      else next.add(locale);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await syncTranslatorRoles(
        userId,
        scopeSlug === ALL_SCHOLARS_VALUE ? null : scopeSlug,
        Array.from(selectedLocales),
        canPublish,
      );
      reload();
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      onTranslatorRolesChange?.();
    } catch (error) {
      console.error("Failed to sync translator locales", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const customTitle = (
    <div className={styles.titleContainer}>
      <span className={styles.titleMain}>
        {t("admin.permissions.manageTranslatorLocales", "Translator Locales")}
      </span>
      <span className={styles.titleSub}>{userName}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customTitle as any}
      width="standard"
      height="auto"
      footer={
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? t("admin.permissions.saving", "Saving…") : t("admin.permissions.save", "Save")}
        </Button>
      }
    >
      <div className={styles.scopeRow}>
        <label className={styles.label} htmlFor="translator-scope-select">
          {t("admin.permissions.scholarLabel", "Scope")}
        </label>
        <select
          id="translator-scope-select"
          className={styles.select}
          value={scopeSlug}
          onChange={(e) => setScopeSlug(e.target.value)}
        >
          <option value={ALL_SCHOLARS_VALUE}>
            {t("admin.permissions.allScholars", "All scholars")}
          </option>
          {scholars.map((scholar) => (
            <option key={scholar.id} value={scholar.slug}>
              {scholar.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.localesRow}>
        {SUPPORTED_LOCALES.map((locale) => (
          <label key={locale} className={styles.localeCheckbox}>
            <input
              type="checkbox"
              checked={selectedLocales.has(locale)}
              onChange={() => handleToggleLocale(locale)}
              disabled={saving}
            />
            {locale.toUpperCase()}
          </label>
        ))}
      </div>

      <div className={styles.publishRow}>
        <span className={styles.label}>{t("admin.permissions.canPublish", "Can publish")}</span>
        <Toggle checked={canPublish} onChange={() => setCanPublish((v) => !v)} disabled={saving} />
      </div>

      {state.loading && !state.translatorRoles ? (
        <div className={styles.loading}>
          {t("admin.permissions.loadingTranslatorRoles", "Loading translator locales…")}
        </div>
      ) : allRoles.length > 0 ? (
        <div className={styles.summary}>
          <span className={styles.summaryTitle}>
            {t("admin.permissions.currentGrants", "Current grants")}
          </span>
          {allRoles.map((role) => (
            <div key={role.id} className={styles.summaryRow}>
              <span>{role.scholarName ?? t("admin.permissions.allScholars", "All scholars")}</span>
              <span>{role.locale.toUpperCase()}</span>
              <span>
                {role.canPublish
                  ? t("admin.permissions.canPublish", "Can publish")
                  : t("admin.permissions.editOnly", "Edit only")}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
