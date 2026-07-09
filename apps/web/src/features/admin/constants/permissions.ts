import type { AdminPermission } from "@sd/core-contracts";

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  "manage:scholars": "Manage Scholars",
  "manage:topics": "Manage Topics",
  "manage:content": "Manage Content",
  "manage:livestreams": "Manage Livestreams",
  "manage:users": "Manage Users",
  "manage:admin": "Manage Admins",
};

export const PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  "manage:scholars": "Add, edit, and remove scholar profiles",
  "manage:topics": "Create and organize topic categories",
  "manage:content": "Publish, archive, and manage lectures and series",
  "manage:livestreams": "Schedule and manage live streaming events",
  "manage:users": "View users and manage their permissions",
  "manage:admin": "Grant and revoke administrative access",
};
