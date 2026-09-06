/** Documents this module's responsibility and public boundary. */
"use client";

import {
  type AccessCapability,
  type AccessGrantRequest,
  type AccessTarget,
  type UserAccessSnapshot,
  type ScholarListItemDto,
  SUPPORTED_LOCALES,
  httpClient,
  endpoints,
} from "@sd/core-contracts";
import { useAccountProfile } from "@sd/domain-account";
import { Fragment, useEffect, useState, type ReactNode } from "react";

import { fetchUserAccess, replaceUserAccess } from "@/features/admin/api/admin.api";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { Separator } from "@/shared/components/ui/separator";
import { Switch as Toggle } from "@/shared/components/ui/switch";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./AccessDialog.module.css";
import { PermissionRow } from "./PermissionRow";
import { RolesBanner } from "./RolesBanner";

type TargetState = {
  enabled: boolean;
  capabilities: { [key in AccessCapability]?: boolean };
  /** Scholar slugs to which the target's permission is scoped. */
  scholarSlugs: string[];
  locales: string[];
};

type UiState = { [key in AccessTarget]: TargetState };

const defaultTargetState = (): TargetState => ({
  enabled: false,
  capabilities: {},
  scholarSlugs: [],
  locales: [],
});

const initialUiState = (): UiState => ({
  scholar: defaultTargetState(),
  listing: defaultTargetState(),
  media: defaultTargetState(),
  topic: defaultTargetState(),
  translation: defaultTargetState(),
  user: defaultTargetState(),
});

const capabilitiesList = (target: AccessTarget): AccessCapability[] =>
  target === "translation"
    ? ["translate", "publish", "delete"]
    : target === "user"
      ? ["manage"]
      : ["write", "publish", "delete"];

function getTargetRoles(target: AccessTarget, item: TargetState): string[] {
  if (!item.enabled) return [];

  const roleChecks: Array<[boolean | undefined, string]> = [
    [item.capabilities.write, "Editor"],
    [item.capabilities.translate, "Translator"],
    [item.capabilities.publish, "Publisher"],
    [item.capabilities.delete, "Deleter"],
    [target === "user" && item.capabilities.manage, "User manager"],
  ];

  const roles: string[] = [];
  for (const [enabled, role] of roleChecks) {
    if (enabled) roles.push(role);
  }
  return roles;
}

function getPreviewRoles(uiState: UiState, isSuperadmin: boolean): string[] {
  const roles = new Set(isSuperadmin ? ["Superadmin"] : []);
  Object.entries(uiState).forEach(([target, item]) => {
    // SAFETY: `uiState` is a full `UiState` record keyed only by `AccessTarget`.
    getTargetRoles(target as AccessTarget, item).forEach((role) => roles.add(role));
  });
  return Array.from(roles).sort();
}

function buildAccessGrants(uiState: UiState): AccessGrantRequest[] {
  const grants: AccessGrantRequest[] = [];
  targetRowConfigs.forEach(({ target }) => {
    const item = uiState[target];
    if (!item.enabled) return;

    // SAFETY: `item.capabilities` is only mutated through AccessCapability-driven UI
    // toggles above, so its enumerable keys are the same AccessCapability domain.
    const enabledCaps = Object.keys(item.capabilities).filter(
      // SAFETY: see note above — each enumerable key originated from an AccessCapability toggle.
      (c) => item.capabilities[c as AccessCapability],
      // SAFETY: see note above — after filtering, the remaining keys are still AccessCapability values.
    ) as AccessCapability[];

    enabledCaps.forEach((capability) => {
      grants.push({
        target,
        capability,
        scholarSlugs: item.scholarSlugs,
        // SAFETY: locale selections come only from SUPPORTED_LOCALES-backed UI chips.
        locales: item.locales as ("en" | "ar")[],
      });
    });
  });
  return grants;
}

interface TargetRowConfig {
  target: AccessTarget;
  title: string;
  description: string;
}

const targetRowConfigs: TargetRowConfig[] = [
  {
    target: "listing",
    title: "Listings (Duruses)",
    description: "Permissions to create, modify, publish, and delete lecture listings.",
  },
  {
    target: "scholar",
    title: "Scholars",
    description: "Permissions to manage scholar profiles and biographies.",
  },
  {
    target: "media",
    title: "Media Files",
    description: "Permissions to upload, manage, and replace raw audio files.",
  },
  {
    target: "topic",
    title: "Topics",
    description: "Permissions to structure category tags and topics.",
  },
  {
    target: "translation",
    title: "Translations",
    description: "Permissions to input metadata translations in multiple locales.",
  },
  {
    target: "user",
    title: "User Management",
    description: "Permissions to edit other administrative users and manage custom grants.",
  },
];

interface AccessDialogBodyProps {
  snapshot?: UserAccessSnapshot;
  /** Human-readable save/load error shown in the dialog. */
  error?: string;
  saving: boolean;
  targetIsSuperadmin: boolean;
  currentUserIsSuperadmin?: boolean;
  /** Current capability and scope selections for every access target. */
  uiState: UiState;
  scholarOptions: {
    /** Stable scholar slug used for scope selection. */ slug: string;
    name: string;
  }[];
  onToggleTarget: (target: AccessTarget, enabled: boolean) => void;
  onToggleCapability: (
    target: AccessTarget,
    capability: AccessCapability,
    checked: boolean,
  ) => void;
  onUpdateScope: (
    target: AccessTarget,
    field: "scholarSlugs" | "locales",
    values: string[],
  ) => void;
  onToggleSuperadmin: (enabled: boolean) => void;
}

function SuperadminAccessSection({
  visible,
  enabled,
  saving,
  onToggle,
}: {
  visible?: boolean;
  enabled: boolean;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  if (!visible) return null;

  return (
    <>
      <div className={styles.row}>
        <div className={styles.rowHeader}>
          <div className={styles.rowMeta}>
            <div className={styles.rowLabelSection}>
              <span className={styles.rowTitle}>Super Admin (Full Access)</span>
              <span className={styles.rowDesc}>
                Grants unrestricted administrative access to the entire platform. Superadmins can
                modify other administrators and manage global system settings.
              </span>
            </div>
          </div>
          <Toggle
            checked={enabled}
            onChange={onToggle}
            disabled={saving}
            aria-label="Toggle super admin access"
          />
        </div>
      </div>
      <Separator />
    </>
  );
}

function AccessDialogBody({
  snapshot,
  error,
  saving,
  targetIsSuperadmin,
  currentUserIsSuperadmin,
  uiState,
  scholarOptions,
  onToggleTarget,
  onToggleCapability,
  onUpdateScope,
  onToggleSuperadmin,
}: AccessDialogBodyProps) {
  const showProtectedWarning = snapshot?.isSuperadmin && !currentUserIsSuperadmin;

  return (
    <Modal.Body className={styles.body}>
      {error && (
        <Alert variant="destructive" className={styles.error}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!snapshot ? (
        <p className={styles.loading}>Loading access…</p>
      ) : showProtectedWarning ? (
        <p className={styles.emptyText}>
          Superadmin access is protected and cannot be edited here.
        </p>
      ) : (
        <div className={styles.container}>
          <RolesBanner roles={getPreviewRoles(uiState, targetIsSuperadmin)} />

          <SuperadminAccessSection
            visible={currentUserIsSuperadmin}
            enabled={targetIsSuperadmin}
            saving={saving}
            onToggle={onToggleSuperadmin}
          />

          {targetRowConfigs.map((config, index) => {
            const targetState = uiState[config.target];
            return (
              <Fragment key={config.target}>
                <PermissionRow
                  key={`${config.target}-${targetState.enabled}`}
                  title={config.title}
                  description={config.description}
                  target={config.target}
                  enabled={targetState.enabled}
                  capabilities={capabilitiesList(config.target)}
                  selectedCapabilities={targetState.capabilities}
                  scholarOptions={scholarOptions}
                  selectedScholars={targetState.scholarSlugs}
                  localeOptions={SUPPORTED_LOCALES}
                  selectedLocales={targetState.locales}
                  saving={saving}
                  onToggleTarget={(checked) => onToggleTarget(config.target, checked)}
                  onToggleCapability={(cap, checked) =>
                    onToggleCapability(config.target, cap, checked)
                  }
                  onUpdateScholars={(slugs) => onUpdateScope(config.target, "scholarSlugs", slugs)}
                  onUpdateLocales={(locales) => onUpdateScope(config.target, "locales", locales)}
                />
                {index < targetRowConfigs.length - 1 && <Separator />}
              </Fragment>
            );
          })}
        </div>
      )}
    </Modal.Body>
  );
}

/** Edits one user's scoped capabilities and persists the complete access snapshot. */
export function AccessDialog({
  userId,
  userName,
  onClose,
  onSaved,
}: {
  /** User identifier whose access grants are being edited. */
  userId: string;
  userName: string;
  onClose: () => void;
  onSaved: () => void;
}): ReactNode {
  const [snapshot, setSnapshot] = useState<UserAccessSnapshot>();
  const [uiState, setUiState] = useState<UiState>(() => initialUiState());
  const [targetIsSuperadmin, setTargetIsSuperadmin] = useState(false);
  const [allScholars, setAllScholars] = useState<ScholarListItemDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const formatScholarName = useFormatScholarName();

  // Fetch current user's profile to check if they are a superadmin
  const { data: profile } = useAccountProfile();
  const currentUserIsSuperadmin = profile?.roles.includes("Superadmin");

  useEffect(() => {
    // Fetch user access info
    fetchUserAccess(userId)
      .then((data) => {
        setSnapshot(data);
        setTargetIsSuperadmin(data.isSuperadmin);

        const ui = initialUiState();
        data.grants.forEach((grant) => {
          const target = grant.target;
          ui[target].enabled = true;
          ui[target].capabilities[grant.capability] = true;
          ui[target].scholarSlugs = Array.from(
            new Set([...ui[target].scholarSlugs, ...grant.scholarSlugs]),
          );
          ui[target].locales = Array.from(new Set([...ui[target].locales, ...grant.locales]));
        });
        setUiState(ui);
      })
      .catch(() => setError("Unable to load access."));

    // Fetch full scholars list to get translated names and titles
    httpClient<{ scholars: ScholarListItemDto[] }>({
      url: endpoints.scholars.directory,
      method: "GET",
    })
      .then((res) => setAllScholars(res.scholars))
      .catch(() => {});
  }, [userId]);

  const handleToggleTarget = (target: AccessTarget, enabled: boolean) => {
    setUiState((prev) => {
      const nextState = { ...prev[target] };
      nextState.enabled = enabled;
      if (enabled) {
        const defaultCap = capabilitiesList(target)[0];
        // SAFETY: `defaultCap` comes directly from `capabilitiesList(target)`, so the
        // computed key is always a valid `AccessCapability` for this target.
        nextState.capabilities = { [defaultCap as string]: true };
      } else {
        nextState.capabilities = {};
        nextState.scholarSlugs = [];
        nextState.locales = [];
      }
      return { ...prev, [target]: nextState };
    });
  };

  const handleToggleCapability = (
    target: AccessTarget,
    cap: AccessCapability,
    checked: boolean,
  ) => {
    setUiState((prev) => {
      const nextState = { ...prev[target] };
      const nextCaps = { ...nextState.capabilities };
      if (checked) {
        nextCaps[cap] = true;
      } else {
        delete nextCaps[cap];
      }
      const hasCaps = Object.keys(nextCaps).length > 0;
      nextState.enabled = hasCaps;
      if (!hasCaps) {
        nextState.scholarSlugs = [];
        nextState.locales = [];
      }
      nextState.capabilities = nextCaps;
      return { ...prev, [target]: nextState };
    });
  };

  const handleUpdateScope = (
    target: AccessTarget,
    field: "scholarSlugs" | "locales",
    values: string[],
  ) => {
    setUiState((prev) => ({
      ...prev,
      [target]: { ...prev[target], [field]: values },
    }));
  };

  const save = async () => {
    if (!snapshot) return;
    setSaving(true);
    setError(undefined);

    const grants = buildAccessGrants(uiState);

    try {
      await replaceUserAccess(userId, {
        version: snapshot.version,
        grants,
        isSuperadmin: targetIsSuperadmin,
      });
      onSaved();
      onClose();
    } catch {
      setError("Access changed elsewhere. Reload and try again.");
    } finally {
      setSaving(false);
    }
  };

  const scholarOptions = allScholars.map((s) => ({
    slug: s.slug,
    name: formatScholarName(s),
  }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Manage access — ${userName}`}
      width="wide"
      contentClassName={styles.dialog}
      footer={
        <div className={styles.footerActions}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={saving || !snapshot}>
            {saving ? "Saving…" : "Save access"}
          </Button>
        </div>
      }
    >
      <AccessDialogBody
        snapshot={snapshot}
        error={error}
        saving={saving}
        targetIsSuperadmin={targetIsSuperadmin}
        currentUserIsSuperadmin={currentUserIsSuperadmin}
        uiState={uiState}
        scholarOptions={scholarOptions}
        onToggleTarget={handleToggleTarget}
        onToggleCapability={handleToggleCapability}
        onUpdateScope={handleUpdateScope}
        onToggleSuperadmin={setTargetIsSuperadmin}
      />
    </Modal>
  );
}
