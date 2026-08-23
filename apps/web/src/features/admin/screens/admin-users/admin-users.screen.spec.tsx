import { useInfiniteAdminUsers } from "@sd/domain-account";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, type Mock } from "bun:test";
import React from "react";

import { AdminUsersScreen } from "./admin-users.screen";

vi.mock("@sd/domain-account", () => ({
  useInfiniteAdminUsers: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (
      key: string,
      fallback?: string | { defaultValue?: string; shown?: number; active?: number },
    ) => {
      const value = typeof fallback === "string" ? fallback : (fallback?.defaultValue ?? key);
      return value
        .replace("{{shown}}", String(typeof fallback === "object" ? fallback.shown : ""))
        .replace("{{active}}", String(typeof fallback === "object" ? fallback.active : ""));
    },
  }),
}));
vi.mock("@/shared/hooks", () => ({
  useDebouncedSearch: () => ({ query: "", setQuery: vi.fn(), debouncedQuery: "" }),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false }),
  useIsDesktop: () => true,
}));
vi.mock("@/features/admin/components/Content/Users/AccessDialog", () => ({
  AccessDialog: () => null,
}));
vi.mock("@/features/admin/components/Content/Users/user-item", () => ({
  UserItem: ({ user }: { user: { name: string } }) => <div>{user.name}</div>,
}));
vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: ({
    data,
    renderItem,
  }: {
    data: unknown[];
    renderItem: (item: any) => React.ReactNode;
  }) => (
    <div>
      {data.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
      ))}
    </div>
  ),
}));

describe("AdminUsersScreen", () => {
  it("shows access status context and filters users without compressing the data model", () => {
    (useInfiniteAdminUsers as Mock<any>).mockReturnValue({
      data: {
        pages: [
          {
            items: [
              { id: "u1", name: "Alice", roles: ["Editor"] },
              { id: "u2", name: "Bob", roles: [] },
            ],
          },
        ],
      },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    });

    render(<AdminUsersScreen />);

    expect(screen.getByText("2 shown · 1 with admin access")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filter by Has admin access" }));

    expect(screen.getByText("1 shown · 1 with admin access")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });
});
