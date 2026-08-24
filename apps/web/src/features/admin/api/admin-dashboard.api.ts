import type { AdminDashboardDto } from "@sd/core-contracts";

import { endpoints, httpClient } from "@sd/core-contracts";

export function fetchAdminDashboard() {
  return httpClient<AdminDashboardDto>({
    url: endpoints.admin.dashboard,
    method: "GET",
  });
}
