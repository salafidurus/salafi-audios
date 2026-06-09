import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LectureEditModal } from "./LectureEditModal";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";

jest.mock("../../api/admin-lectures.api", () => ({
  createLecture: jest.fn(),
  updateLecture: jest.fn(),
}));

jest.mock("@sd/core-contracts", () => {
  const actual = jest.requireActual("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: jest.fn((key) => {
      // Mock queries return empty/mocked lists
      if (key[0] === "scholars") {
        return {
          data: {
            scholars: [
              { id: "scholar-1", name: "Scholar One", slug: "scholar-one" },
              { id: "scholar-2", name: "Scholar Two", slug: "scholar-two" },
            ],
          },
          isFetching: false,
        };
      }
      if (key[0] === "topics") {
        return {
          data: [
            { id: "topic-1", name: "Topic One", slug: "topic-1" },
            { id: "topic-2", name: "Topic Two", slug: "topic-2" },
          ],
          isFetching: false,
        };
      }
      if (key[0] === "series") {
        return {
          data: [{ id: "series-1", title: "Series One", scholarId: "scholar-2" }],
          isFetching: false,
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

describe("LectureEditModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<LectureEditModal isOpen={false} onClose={jest.fn()} onSuccess={jest.fn()} />);
    expect(screen.queryByText(/lecture details/i)).not.toBeInTheDocument();
  });

  it("renders with create form fields and triggers save", async () => {
    const onSuccessMock = jest.fn();
    const onCloseMock = jest.fn();
    (createLecture as jest.Mock).mockResolvedValue({ id: "new-lecture-id" });

    render(
      <LectureEditModal
        isOpen={true}
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        initialAudioData={{
          audioKey: "audio/new-key.mp3",
          durationSeconds: 300,
          sizeBytes: 50000,
          format: "audio/mp3",
          filename: "test.mp3",
        }}
      />,
    );

    expect(screen.getByText(/new lecture details/i)).toBeInTheDocument();

    // Fill in title
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "My Great Lecture" } });

    // Select Scholar
    const scholarSelect = screen.getByLabelText(/scholar/i);
    fireEvent.change(scholarSelect, { target: { value: "scholar-1" } });

    // Click Save
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createLecture).toHaveBeenCalledWith({
        title: "My Great Lecture",
        slug: "my-great-lecture",
        scholarId: "scholar-1",
        audioKey: "audio/new-key.mp3",
        durationSeconds: 300,
        sizeBytes: 50000,
        format: "audio/mp3",
        topics: [],
        seriesId: undefined,
      });
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("renders with edit form fields prefilled and updates details", async () => {
    const onSuccessMock = jest.fn();
    const onCloseMock = jest.fn();
    (updateLecture as jest.Mock).mockResolvedValue({ id: "edit-lecture-id" });

    const existingLecture = {
      id: "lecture-123",
      title: "Existing Title",
      slug: "existing-title",
      description: "Existing Description",
      scholarId: "scholar-2",
      seriesId: "series-1",
      status: "draft" as const,
      orderIndex: 5,
      topics: ["topic-1"],
      audioKey: "audio/old-key.mp3",
      createdAt: "2024-01-01",
      scholarName: "Scholar Two",
    };

    render(
      <LectureEditModal
        isOpen={true}
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        lecture={existingLecture}
      />,
    );

    expect(screen.getByText(/edit lecture details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue("Existing Title");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Existing Description");
    expect(screen.getByLabelText(/scholar/i)).toHaveValue("scholar-2");
    expect(screen.getByLabelText(/series/i)).toHaveValue("series-1");
    expect(screen.getByLabelText(/order index/i)).toHaveValue(5);

    // Modify some values
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Updated Title" } });
    fireEvent.change(screen.getByLabelText(/order index/i), { target: { value: "10" } });

    // Click Save
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(updateLecture).toHaveBeenCalledWith("lecture-123", {
        title: "Updated Title",
        description: "Existing Description",
        status: "draft",
        orderIndex: 10,
      });
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
