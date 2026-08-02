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
  permissions: [] as import("@sd/core-contracts").Permission[],
};

describe("UserItem", () => {
  it("shows Manage Permissions button only when the user can grant UserPermission", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("grant", "UserPermission")),
      isLoading: false,
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Manage Permissions" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage Roles" })).not.toBeInTheDocument();
  });

  it("shows Manage Roles button only when the user can grant UserRoleAssignment", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("grant", "UserRoleAssignment")),
      isLoading: false,
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Manage Permissions" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Roles" })).toBeInTheDocument();
  });

  it("hides every management button when the user has no grant capability", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => can("read", "User")),
      isLoading: false,
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Manage Permissions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage Roles" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage Scholar Access" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Manage Translator Locales" }),
    ).not.toBeInTheDocument();
  });

  it("shows Manage Scholar Access and Manage Translator Locales when granted", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: abilityWith((can) => {
        can("grant", "UserScholarRole");
        can("grant", "UserTranslatorRole");
      }),
      isLoading: false,
    });

    render(
      <UserItem user={baseUser} onManageScholarRoles={vi.fn()} onManageTranslatorRoles={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Manage Scholar Access" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Translator Locales" })).toBeInTheDocument();
  });
});
