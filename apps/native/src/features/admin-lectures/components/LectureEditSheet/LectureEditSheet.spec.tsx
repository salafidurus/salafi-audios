import React from "react";
import renderer, { act } from "react-test-renderer";
import { LectureEditSheet } from "./LectureEditSheet";

jest.mock("@/features/admin-lectures/api/admin-lectures.api", () => ({
  fetchAdminLectureDetail: jest.fn().mockResolvedValue({
    id: "lec-1",
    title: "Test Lecture",
    status: "draft",
    audioKey: "audio/test.mp3",
  }),
  updateLecture: jest.fn(),
}));

describe("LectureEditSheet", () => {
  it("renders nothing when lectureId is null", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <LectureEditSheet lectureId={null} onClose={() => {}} onSaved={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it("renders edit form when lectureId is provided", async () => {
    let tree: ReturnType<typeof renderer.create>;
    await act(async () => {
      tree = renderer.create(
        <LectureEditSheet lectureId="lec-1" onClose={() => {}} onSaved={() => {}} />,
      );
    });
    // Flush any remaining microtasks from the useEffect's async fetch
    await act(async () => {});
    expect(JSON.stringify(tree!.toJSON())).toContain("Edit Lecture");
    expect(JSON.stringify(tree!.toJSON())).toContain("Title");
  }, 15000);
});
