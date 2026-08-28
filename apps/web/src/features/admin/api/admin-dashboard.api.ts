import type { AdminDashboardDto } from "@sd/core-contracts";

import { endpoints, httpClient } from "@sd/core-contracts";

/** Documents this module's responsibility and public boundary. */
export function fetchAdminDashboard() {
  return httpClient<AdminDashboardDto>({
    url: endpoints.admin.dashboard,
    method: "GET",
  });
}
