import React from "react";
import { render, screen } from "@testing-library/react-native";
import { LectureEditSheet } from "./LectureEditSheet";

jest.mock("@/features/admin/api/admin-lectures.api", () => ({
  fetchAdminLectureDetail: jest.fn().mockResolvedValue({
    id: "lec-1",
    title: "Test Lecture",
    status: "draft",
    audioKey: "audio/test.mp3",
  }),
  updateLecture: jest.fn(),
}));

describe("LectureEditSheet", () => {
  it("renders nothing when lectureId is null", async () => {
    await render(<LectureEditSheet lectureId={null} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders edit form when lectureId is provided", async () => {
    await render(<LectureEditSheet lectureId="lec-1" onClose={() => {}} onSaved={() => {}} />);
    // findByText waits for the useEffect's async fetch to settle.
    expect(await screen.findByText("Edit Lecture")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
  }, 15000);
});
