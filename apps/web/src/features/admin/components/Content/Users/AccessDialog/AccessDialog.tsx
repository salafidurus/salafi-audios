"use client";

import {
  type AccessCapability,
  type AccessGrantRequest,
  type AccessTarget,
  type UserAccessSnapshot,
  SUPPORTED_LOCALES,
} from "@sd/core-contracts";
import { useEffect, useState, type ReactNode } from "react";

import { fetchUserAccess, replaceUserAccess } from "@/features/admin/api/admin.api";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal/Modal";

const targetOptions: AccessTarget[] = [
  "scholar",
  "listing",
  "media",
  "topic",
  "translation",
  "user",
];
const capabilities = (target: AccessTarget): AccessCapability[] =>
  target === "translation"
    ? ["translate", "publish", "delete"]
    : target === "user"
      ? ["manage"]
      : ["write", "publish", "delete"];
const scholarScoped = (target: AccessTarget) =>
  ["scholar", "listing", "media", "translation"].includes(target);
const emptyGrant = (): AccessGrantRequest => ({
  target: "listing",
  capability: "write",
  scholarSlugs: [],
  locales: [],
});

export function AccessDialog({
  userId,
  userName,
  onClose,
  onSaved,
}: {
  userId: string;
  userName: string;
  onClose: () => void;
  onSaved: () => void;
}): ReactNode {
  const [snapshot, setSnapshot] = useState<UserAccessSnapshot>();
  const [grants, setGrants] = useState<AccessGrantRequest[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetchUserAccess(userId)
      .then((data) => {
        setSnapshot(data);
        setGrants(data.grants);
      })
      .catch(() => setError("Unable to load access."));
  }, [userId]);
  const update = (index: number, patch: Partial<AccessGrantRequest>) =>
    setGrants((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const save = async () => {
    if (!snapshot) return;
    setSaving(true);
    setError(undefined);
    try {
      await replaceUserAccess(userId, { version: snapshot.version, grants });
      onSaved();
      onClose();
    } catch {
      setError("Access changed elsewhere. Reload and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Manage access — ${userName}`}
      width="standard"
      footer={
        <Button variant="primary" onClick={save} disabled={saving || !snapshot}>
          {saving ? "Saving…" : "Save access"}
        </Button>
      }
    >
      {error && <p role="alert">{error}</p>}
      {!snapshot ? (
        <p>Loading access…</p>
      ) : snapshot.isSuperadmin ? (
        <p>Superadmin access is protected and cannot be edited here.</p>
      ) : (
        <>
          <p>Effective roles: {snapshot.roles.join(", ") || "Listener"}</p>
          {grants.map((grant, index) => (
            <fieldset key={JSON.stringify(grant)} disabled={saving} style={{ marginBottom: 16 }}>
              <legend>Access grant</legend>
              <select
                aria-label={`Access area ${index + 1}`}
                value={grant.target}
                onChange={(event) => {
                  const target = event.target.value as AccessTarget;
                  update(index, {
                    target,
                    capability: capabilities(target)[0],
                    scholarSlugs: scholarScoped(target) ? grant.scholarSlugs : [],
                    locales: target === "translation" ? grant.locales : [],
                  });
                }}
              >
                {targetOptions.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </select>{" "}
              <select
                aria-label={`Access capability ${index + 1}`}
                value={grant.capability}
                onChange={(event) =>
                  update(index, { capability: event.target.value as AccessCapability })
                }
              >
                {capabilities(grant.target).map((capability) => (
                  <option key={capability} value={capability}>
                    {capability}
                  </option>
                ))}
              </select>{" "}
              <Button
                variant="secondary"
                onClick={() => setGrants((items) => items.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
              {scholarScoped(grant.target) && (
                <div>
                  <p>Scholars (none means all):</p>
                  {snapshot.scholars.map((scholar) => (
                    <label key={scholar.slug} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        checked={grant.scholarSlugs.includes(scholar.slug)}
                        onChange={() =>
                          update(index, {
                            scholarSlugs: grant.scholarSlugs.includes(scholar.slug)
                              ? grant.scholarSlugs.filter((slug) => slug !== scholar.slug)
                              : [...grant.scholarSlugs, scholar.slug],
                          })
                        }
                      />{" "}
                      {scholar.name}
                    </label>
                  ))}
                </div>
              )}
              {grant.target === "translation" && (
                <div>
                  <p>Locales:</p>
                  {SUPPORTED_LOCALES.map((locale) => (
                    <label key={locale} style={{ marginRight: 12 }}>
                      <input
                        type="checkbox"
                        checked={grant.locales.includes(locale)}
                        onChange={() =>
                          update(index, {
                            locales: grant.locales.includes(locale)
                              ? grant.locales.filter((item) => item !== locale)
                              : [...grant.locales, locale],
                          })
                        }
                      />{" "}
                      {locale.toUpperCase()}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}
          <Button
            variant="secondary"
            onClick={() => setGrants((items) => [...items, emptyGrant()])}
          >
            Add access grant
          </Button>
        </>
      )}
    </Modal>
  );
}
