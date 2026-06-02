import type { Metadata } from "next";
import { AdminPermissionsScreen } from "@/features/admin/screens/admin-permissions/admin-permissions.screen";

export const metadata: Metadata = {
  title: "Manage Permissions",
  description: "Configure user roles and access permissions.",
};

export default function AdminPermissionsPage() {
  return <AdminPermissionsScreen />;
}
