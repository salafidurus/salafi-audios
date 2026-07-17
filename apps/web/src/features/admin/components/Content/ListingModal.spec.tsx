import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ListingModal } from "./ListingModal";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";

vi.mock("../../api/admin-lectures.api", () => ({
  createLecture: vi.fn(),
  updateLecture: vi.fn(),
}));

vi.mock("@sd/core-contracts", () => {
  // Import the real module to preserve all exports
  const actual = require("@sd/core-contracts");
  return {
    ...actual,
    useApiQuery: vi.fn((key: any) => {
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
  };
});

describe("ListingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<ListingModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText(/lecture details/i)).not.toBeInTheDocument();
  });

  it("renders with create form fields and triggers save", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (createLecture as Mock<any>).mockResolvedValue({ id: "new-lecture-id" });

    render(
      <ListingModal
        isOpen
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

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "My Great Lecture" } });

    const scholarTrigger = screen.getByTestId("scholar-dropdown");
    fireEvent.click(scholarTrigger);
    const scholarOption = await screen.findByRole("option", { name: /scholar one/i });
    fireEvent.click(scholarOption);

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createLecture).toHaveBeenCalledWith({
        title: "My Great Lecture",
        slug: "my-great-lecture",
        scholarId: "scholar-1",
        parentId: undefined,
        topics: [],
        format: "single",
        audioKey: "audio/new-key.mp3",
        durationSeconds: 300,
        sizeBytes: 50000,
      });
    });

    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("renders with edit form fields prefilled and updates details", async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    (updateLecture as Mock<any>).mockResolvedValue({ id: "edit-lecture-id" });

    const existingLecture = {
      id: "lecture-123",
      title: "Existing Title",
      slug: "existing-title",
      description: "Existing Description",
      format: "single" as const,
      status: "draft" as const,
      scholarId: "scholar-2",
      scholarName: "Scholar Two",
      parentId: "series-1",
      orderIndex: 5,
      topics: ["topic-1"],
      audioKey: "audio/old-key.mp3",
      createdAt: "2024-01-01",
      audioAssets: [],
    };

    render(
      <ListingModal
        isOpen
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        listing={existingLecture}
      />,
    );

    expect(screen.getByText(/edit lecture details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue("Existing Title");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Existing Description");
    await waitFor(() => {
      expect(screen.getByTestId("scholar-dropdown")).toHaveTextContent("Scholar Two");
      expect(screen.getByTestId("series-dropdown")).toHaveTextContent("Series One");
    });
    expect(screen.getByLabelText(/order index/i)).toHaveValue(5);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "Updated Title" } });
    fireEvent.change(screen.getByLabelText(/order index/i), { target: { value: "10" } });

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
