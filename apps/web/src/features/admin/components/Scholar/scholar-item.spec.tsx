import { describe, it, expect, vi, type Mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Scholar } from ".";
import { useAdminPermissions } from "@sd/domain-account";

vi.mock("@sd/domain-account", () => ({
  useAdminPermissions: vi.fn(),
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
  it("hides edit button when user lacks SCHOLARS_EDIT", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.queryByRole("button", { name: /edit ibn baz/i })).not.toBeInTheDocument();
  });

  it("shows edit button when user has SCHOLARS_EDIT", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_EDIT"] },
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /edit ibn baz/i })).toBeInTheDocument();
  });

  it("never renders a KIBAR badge (isKibar removed)", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn()} />);

    expect(screen.queryByText("KIBAR")).not.toBeInTheDocument();
  });
});
