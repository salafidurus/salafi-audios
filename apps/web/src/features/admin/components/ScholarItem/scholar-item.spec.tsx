import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScholarItem } from "./ScholarItem";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));

const baseProps = {
  id: "s1",
  name: "Ibn Baz",
  slug: "ibn-baz",
  isKibar: true,
  lectureCount: 12,
  onEdit: vi.fn(),
};

describe("ScholarItem", () => {
  it("hides edit button when user lacks SCHOLARS_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<ScholarItem {...baseProps} />);

    expect(screen.queryByRole("button", { name: /edit ibn baz/i })).not.toBeInTheDocument();
  });

  it("shows edit button when user has SCHOLARS_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["SCHOLARS_EDIT"] },
    });

    render(<ScholarItem {...baseProps} />);

    expect(screen.getByRole("button", { name: /edit ibn baz/i })).toBeInTheDocument();
  });
});
