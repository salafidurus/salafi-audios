import { AdminListingsScreen } from "@/features/admin/screens/admin-listings/admin-listings.screen";

/** Defines the independent Admin listings route outside the persistent tab shell. */
/** Exposes listing management outside the five primary tabs while preserving the feature screen's capability-aware behavior. */
export default function AdminListingsRoute() {
  return <AdminListingsScreen />;
}
