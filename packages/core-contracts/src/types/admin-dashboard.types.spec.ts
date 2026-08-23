import { describe, expect, it } from "bun:test";

import { AdminDashboardDtoSchema } from "./admin-dashboard.types";

describe("AdminDashboardDtoSchema", () => {
  it("distinguishes unavailable metrics from visible zero counts", () => {
    const dashboard = AdminDashboardDtoSchema.parse({
      metrics: { scholars: 0, listings: 3 },
      activity: [],
      pendingWork: [],
    });

    expect(dashboard.metrics.scholars).toBe(0);
    expect(dashboard.metrics.users).toBeUndefined();
  });

  it("requires real pending work and activity fields", () => {
    expect(
      AdminDashboardDtoSchema.parse({
        metrics: {},
        activity: [
          {
            id: "listing-1",
            type: "listing",
            title: "A lesson",
            subtitle: "A scholar",
            status: "review",
            occurredAt: "2026-08-24T00:00:00.000Z",
            href: "/admin/contents?listing=listing-1",
          },
        ],
        pendingWork: [
          {
            id: "listing-1",
            title: "A lesson",
            scholarName: "A scholar",
            status: "review",
            updatedAt: "2026-08-24T00:00:00.000Z",
            href: "/admin/contents?listing=listing-1",
          },
        ],
      }),
    ).toBeTruthy();
  });
});
