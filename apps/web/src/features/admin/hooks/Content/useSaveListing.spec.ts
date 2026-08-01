import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";

import { createLecture, updateListingDetails } from "@/features/admin/api/admin-lectures.api";

import type { FormState } from "./useListingForm";

import { useSaveListing } from "./useSaveListing";

vi.mock("@/features/admin/api/admin-lectures.api", () => ({
  createLecture: vi.fn().mockResolvedValue({ id: "listing-1" }),
  updateListingDetails: vi.fn().mockResolvedValue({ id: "listing-1" }),
  getPresignedUrl: vi.fn(),
  uploadToR2: vi.fn(),
}));

function buildCreateState(overrides: Partial<FormState> = {}): FormState {
  return {
    title: "Test Listing",
    slug: "scholar-test-listing",
    slugSuffix: "test-listing",
    description: "",
    scholarId: "scholar-1",
    format: "single",
    status: "draft",
    orderIndex: 0,
    selectedTopics: ["topic-1"],
    language: "ar",
    coverImageUrl: "",
    initialSnapshot: null,
    saving: false,
    formError: null,
    isEditing: false,
    stagedImageFile: null,
    stagedImagePreview: null,
    ...overrides,
  };
}

function submit(state: FormState) {
  const hook = renderHook(() =>
    useSaveListing(
      state,
      () => {},
      async () => {},
      () => {},
      () => {},
    ),
  );
  return act(() => hook.result.current({ preventDefault: () => {} } as unknown as React.FormEvent));
}

describe("useSaveListing — create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes the selected status in the create payload", async () => {
    await submit(buildCreateState({ status: "review" }));

    expect(createLecture).toHaveBeenCalledTimes(1);
    const payload = (createLecture as Mock<any>).mock.calls[0]![0] as { status: string };
    expect(payload.status).toBe("review");
  });

  it("includes the selected status in the update payload (regression check)", async () => {
    await submit(
      buildCreateState({
        isEditing: true,
        id: "listing-1",
        status: "published",
      }),
    );

    expect(updateListingDetails).toHaveBeenCalledTimes(1);
    const payload = (updateListingDetails as Mock<any>).mock.calls[0]![1] as { status: string };
    expect(payload.status).toBe("published");
  });
});
