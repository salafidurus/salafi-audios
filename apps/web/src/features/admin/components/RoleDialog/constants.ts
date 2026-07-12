import type { UserRole } from "@sd/core-contracts";

// Role labels matching ROLE_CHIPS
export const ROLE_LABELS: Record<UserRole, string> = {
  listener: "Listener",
  scholar: "Scholar",
  translator: "Translator",
  editor: "Editor",
  admin: "Admin",
  superadmin: "Super Admin",
};

// Available roles in order
export const ROLES_ARRAY: UserRole[] = [
  "listener",
  "scholar",
  "translator",
  "editor",
  "admin",
  "superadmin",
];

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  listener: "Regular user who listens to lectures",
  scholar: "Content creator who manages their own lectures",
  translator: "Translates content to assigned languages",
  editor: "Edits and reviews content listings",
  admin: "Manages users, scholars, and content catalog",
  superadmin: "Full system control and configurations",
};
