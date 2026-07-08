/**
 * TypeScript verification file for Badge component.
 * This file demonstrates that TypeScript correctly infers the props
 * for each variant and provides appropriate type safety.
 *
 * This file is not executed - it exists purely to verify type checking.
 */

import { Shield } from "lucide-react";
import { Badge } from "./Badge";

// ✅ Valid: Permission badge with icon
const _PermissionWithIcon = () => (
  <Badge variant="permission" permission="read:users" icon={<Shield />} />
);

// ✅ Valid: Permission badge without icon
const _PermissionWithoutIcon = () => <Badge variant="permission" permission="write:posts" />;

// ✅ Valid: Admin role badge
const _AdminRole = () => <Badge variant="role" role="admin" />;

// ✅ Valid: User role badge
const _UserRole = () => <Badge variant="role" role="user" />;

// ✅ Valid: Status badge with explicit color
const _StatusWithColor = () => <Badge variant="status" status="Active" color="success" />;

// ✅ Valid: Status badge with default color
const _StatusWithDefaultColor = () => <Badge variant="status" status="Pending" />;

// Invalid: permission variant missing required permission prop
// @ts-expect-error
const _InvalidPermissionMissingProp = () => <Badge variant="permission" />;

// Invalid: role variant missing required role prop
// @ts-expect-error
const _InvalidRoleMissingProp = () => <Badge variant="role" />;

// Invalid: role variant with invalid role value
// @ts-expect-error
const _InvalidRoleValue = () => <Badge variant="role" role="superadmin" />;

// Invalid: status variant missing required status prop
// @ts-expect-error
const _InvalidStatusMissingProp = () => <Badge variant="status" />;

// Invalid: status variant with invalid color value
const _InvalidStatusColor = () => (
  // @ts-expect-error
  <Badge variant="status" status="Active" color="danger" />
);

// Invalid: permission variant cannot have role prop
const _InvalidPermissionWithRole = () => (
  // @ts-expect-error
  <Badge variant="permission" permission="read:users" role="admin" />
);

// Invalid: role variant cannot have permission prop
const _InvalidRoleWithPermission = () => (
  // @ts-expect-error
  <Badge variant="role" role="admin" permission="read:users" />
);
