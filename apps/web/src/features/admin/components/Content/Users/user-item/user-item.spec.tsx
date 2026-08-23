import type { AppAbility } from "@sd/core-contracts";

import { createMongoAbility, AbilityBuilder } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "bun:test";

import { UserItem } from "./user-item";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isTablet: false }),
  useIsDesktop: () => true,
}));

function abilityWith(build: (can: AbilityBuilder<AppAbility>["can"]) => void): AppAbility {
  const { can, build: buildAbility } = new AbilityBuilder<AppAbility>(createMongoAbility);
  build(can);
  return buildAbility();
}

const baseUser = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  image: null,
  roles: [],
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("UserItem", () => {
  it("shows one Manage Access button when the user can manage UserAccess", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("manage", "UserAccess")),
      isLoading: false,
    });

    render(<UserItem user={baseUser} onManageAccess={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: "Manage Access" })).toHaveLength(1);
  });

  it("hides every management button when the user has no grant capability", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("read", "User")),
      isLoading: false,
    });

    render(<UserItem user={baseUser} onManageAccess={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Manage Access" })).not.toBeInTheDocument();
  });

  it("presents desktop user management as a dense row with status and secondary actions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("manage", "UserAccess")),
      isLoading: false,
    });

    render(<UserItem user={{ ...baseUser, roles: ["Editor"] }} onManageAccess={vi.fn()} />);

    expect(screen.getByTestId("admin-user-row")).toBeInTheDocument();
    expect(screen.getByText("Active access")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Access" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More actions for Alice" })).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
  });
});
