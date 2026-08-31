import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { CollectionSheet } from "./CollectionSheet";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));
jest.mock("@/features/admin/api/admin-scholars.api", () => ({
  createCollection: jest.fn(),
  updateCollection: jest.fn(),
}));
jest.mock("@sd/domain-account", () => ({
  useAbility: jest.fn(),
}));
jest.mock("@/core/auth/use-auth", () => ({
  useAuth: jest.fn(() => ({ isAuthenticated: true, isLoading: false, user: undefined })),
}));

const mockedUseAbility = jest.mocked(useAbility) as any;

describe("CollectionSheet", () => {
  beforeEach(() => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "create", subject: "Listing", conditions: { scholarSlug: "s1" } },
        { action: "update", subject: "Listing", conditions: { scholarSlug: "s1" } },
      ]),
      isLoading: false,
    });
  });

  it("renders create form when no collection is provided", async () => {
    await render(
      <CollectionSheet
        isOpen={true}
        scholarId="s1"
        scholarSlug="s1"
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByText("New Collection")).toBeTruthy();
    expect(screen.getByText("Title", { exact: false })).toBeTruthy();
  });

  it("renders Edit Collection title when collection is provided", async () => {
    await render(
      <CollectionSheet
        isOpen={true}
        scholarId="s1"
        scholarSlug="s1"
        collection={{
          id: "col1",
          title: "My Collection",
          format: "collection",
          status: "draft",
          scholarId: "s1",
          scholarSlug: "s1",
          scholarName: "Scholar One",
          slug: "my-collection",
          topics: [],
          createdAt: "2026-07-04T00:00:00Z",
        }}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByText("Edit Collection")).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <CollectionSheet
        isOpen={false}
        scholarId="s1"
        scholarSlug="s1"
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.toJSON()).toBeNull();
  });

  it("enables Save when the ability grants create for this scholar", async () => {
    await render(
      <CollectionSheet
        isOpen={true}
        scholarId="s1"
        scholarSlug="s1"
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton?.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("disables Save when the ability does not grant create for this scholar", async () => {
    mockedUseAbility.mockReturnValue({
      ability: createMongoAbility([
        { action: "create", subject: "Listing", conditions: { scholarSlug: "some-other-scholar" } },
      ]),
      isLoading: false,
    });

    await render(
      <CollectionSheet
        isOpen={true}
        scholarId="s1"
        scholarSlug="s1"
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton?.props.accessibilityState?.disabled).toBe(true);
  });
});
