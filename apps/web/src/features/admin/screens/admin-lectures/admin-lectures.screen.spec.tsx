import { vi, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminLecturesScreen } from "./admin-lectures.screen";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";
import { useResponsive } from "@/shared/hooks/use-responsive";

vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
  useAdminPermissions: vi.fn(),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));
vi.mock("../../api/admin-lectures.api", () => ({
  fetchAdminLectures: vi.fn(),
  fetchAdminLectureDetail: vi.fn(),
}));
vi.mock("@sd/core-contracts", async (importActual) => {
  const actual = await importActual<typeof import("@sd/core-contracts")>();
  return { ...actual, useApiQuery: vi.fn() };
});
vi.mock("../../components/AudioUploader/AudioUploader", () => ({
  AudioUploader: () => null,
}));
vi.mock("../../components/ListingEditModal/ListingEditModal", () => ({
  ListingEditModal: () => null,
}));

const mockListingsResponse = {
  items: [
    {
      id: "l1",
      title: "Test Lecture",
      scholarName: "Scholar A",
      status: "published",
      durationSeconds: 3600,
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "l2",
      title: "Another Lecture",
      scholarName: "Scholar B",
      status: "draft",
      durationSeconds: 1800,
      createdAt: "2024-02-01T00:00:00.000Z",
    },
  ],
  total: 2,
};

describe("AdminLecturesScreen action button gates", () => {
  beforeEach(() => {
    (useApiQuery as Mock).mockReturnValue({
      data: mockListingsResponse,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it("hides Upload Audio button when user lacks MEDIA_UPLOAD", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LISTINGS_VIEW"] },
    });

    render(<AdminLecturesScreen />);

    expect(screen.queryByText("Upload Audio")).not.toBeInTheDocument();
  });

  it("shows Upload Audio button when user has MEDIA_UPLOAD", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["MEDIA_UPLOAD"] },
    });

    render(<AdminLecturesScreen />);

    expect(screen.getByText("Upload Audio")).toBeInTheDocument();
  });

  it("hides Edit buttons when user lacks LISTINGS_EDIT", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["LISTINGS_VIEW"] },
    });

    render(<AdminLecturesScreen />);

    expect(screen.queryAllByText("Edit")).toHaveLength(0);
  });
});
