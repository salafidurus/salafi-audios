import { AdminListingsScreen } from "@/features/admin/screens/admin-listings/admin-listings.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/admin/listings route and delegates behavior to the feature layer. */
/** Renders the native admin listings route surface and coordinates its user-facing state. */
export default function AdminListingsRoute() {
  return <AdminListingsScreen />;
}
