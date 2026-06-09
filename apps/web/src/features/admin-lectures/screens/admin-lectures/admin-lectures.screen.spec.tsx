import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminLecturesScreen } from "./admin-lectures.screen";
import { fetchAdminLectures, fetchAdminLectureDetail } from "../../api/admin-lectures.api";

jest.mock("../../api/admin-lectures.api", () => ({
  fetchAdminLectures: jest.fn(),
  fetchAdminLectureDetail: jest.fn(),
}));

jest.mock("@sd/core-contracts", () => {
  const actual = jest.requireActual("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: jest.fn((key, fn) => {
      // Mock queries
      if (key[0] === "scholars") {
        return { data: { scholars: [] }, isFetching: false };
      }
      if (key[0] === "topics") {
        return { data: [], isFetching: false };
      }
      if (key[0] === "series") {
        return { data: [], isFetching: false };
      }
      if (key[0] === "admin" && key[1] === "lectures") {
        return {
          data: {
            items: [
              {
                id: "lec-1",
                title: "Lecture One",
                scholarName: "Scholar Alpha",
                status: "published",
                createdAt: "2026-01-01T00:00:00Z",
                durationSeconds: 300,
              },
              {
                id: "lec-2",
                title: "Lecture Two",
                scholarName: "Scholar Beta",
                status: "draft",
                createdAt: "2026-01-02T00:00:00Z",
                durationSeconds: 150,
              },
            ],
            total: 2,
            page: 1,
          },
          isFetching: false,
          refetch: jest.fn(),
        };
      }
      return { data: undefined, isFetching: false };
    }),
    queryKeys: {
      scholars: {
        list: () => ["scholars", "list"],
      },
      topics: {
        list: () => ["topics", "list"],
      },
      admin: {
        series: {
          list: () => ["series", "all-list"],
        },
      },
    },
  };
});

describe("AdminLecturesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (fetchAdminLectures as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: "lec-1",
            title: "Lecture One",
            scholarName: "Scholar Alpha",
            status: "published",
            createdAt: "2026-01-01",
          },
          {
            id: "lec-2",
            title: "Lecture Two",
            scholarName: "Scholar Beta",
            status: "draft",
            createdAt: "2026-01-02",
          },
        ],
        total: 2,
        page: 1,
      },
      isFetching: false,
      refetch: jest.fn(),
    });
  });

  it("renders the screen title and lists lectures", () => {
    render(<AdminLecturesScreen />);
    expect(screen.getByText("Manage Lectures")).toBeInTheDocument();
    expect(screen.getByText("Lecture One")).toBeInTheDocument();
    expect(screen.getByText("Lecture Two")).toBeInTheDocument();
  });

  it("opens edit modal when edit button is clicked", async () => {
    (fetchAdminLectureDetail as jest.Mock).mockResolvedValue({
      id: "lec-1",
      title: "Lecture One",
      scholarId: "scholar-1",
      status: "published",
      topics: [],
      createdAt: "2026-01-01",
    });

    render(<AdminLecturesScreen />);

    // Click Edit button for the first lecture
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(fetchAdminLectureDetail).toHaveBeenCalledWith("lec-1");
      expect(screen.getByText("Edit Lecture Details")).toBeInTheDocument();
    });
  });
});
