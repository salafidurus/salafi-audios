import type { AdminDashboardDto } from "@sd/core-contracts";

import { endpoints, httpClient } from "@sd/core-contracts";

/** Exposes the admin dashboard data boundary. */
/** Fetches aggregate counts and recent activity for the admin dashboard. */
export function fetchAdminDashboard() {
  return httpClient<AdminDashboardDto>({
    url: endpoints.admin.dashboard,
    method: "GET",
  });
}
