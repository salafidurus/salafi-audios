import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "bun:test";

import { Scholar } from ".";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));

const baseScholar = {
  id: "s1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  bio: "A great scholar.",
  country: "SA" as const,
  mainLanguage: "ar" as const,
  imageUrl: undefined,
  isActive: true,
  orderIndex: 999,
  socialTwitter: undefined,
  socialTelegram: undefined,
  socialYoutube: undefined,
  socialWebsite: undefined,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: undefined,
  translations: [],
};

describe("ScholarItem", () => {
  it("hides edit button when the user cannot update this scholar", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "Scholar" }]),
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /edit ibn baz/i })).not.toBeInTheDocument();
  });

  it("shows edit button when the user can update this scholar", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([
        { action: "update", subject: "Scholar", conditions: { slug: "ibn-baz" } },
      ]),
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /edit ibn baz/i })).toBeInTheDocument();
  });

  it("hides edit button when the user can only update a different scholar (cross-scholar denial)", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([
        { action: "update", subject: "Scholar", conditions: { slug: "some-other-scholar" } },
      ]),
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /edit ibn baz/i })).not.toBeInTheDocument();
  });

  it("never renders a KIBAR badge (isKibar removed)", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "manage", subject: "all" }]),
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.queryByText("KIBAR")).not.toBeInTheDocument();
  });

  it("prefixes the name with the translated honorific title", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "manage", subject: "all" }]),
    });

    render(
      <Scholar.Item
        scholar={{ ...baseScholar, name: "Abdullah bn AbdirRaheem al-Bukhari", title: "allamah" }}
        onEdit={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Shaykh Allamah Abdullah bn AbdirRaheem al-Bukhari"),
    ).toBeInTheDocument();
  });
});
