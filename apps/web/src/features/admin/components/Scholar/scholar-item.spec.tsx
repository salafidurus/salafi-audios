import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { Scholar } from ".";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn<any>(),
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
  isKibar: true,
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
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn<any>()} />);

    expect(screen.queryByRole("button", { name: /edit ibn baz/i })).not.toBeInTheDocument();
  });

  it("shows edit button when user has SCHOLARS_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["SCHOLARS_EDIT"] },
    });

    render(<Scholar.Item scholar={baseScholar} onEdit={vi.fn<any>()} />);

    expect(screen.getByRole("button", { name: /edit ibn baz/i })).toBeInTheDocument();
  });
});
