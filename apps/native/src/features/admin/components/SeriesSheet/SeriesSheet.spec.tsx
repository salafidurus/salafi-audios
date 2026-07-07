import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SeriesSheet } from "./SeriesSheet";

jest.mock("@/features/admin/api/admin-scholars.api", () => ({
  createSeries: jest.fn(),
  updateSeries: jest.fn(),
}));

describe("SeriesSheet", () => {
  it("renders create form when no series is provided", async () => {
    await render(
      <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.getByText("New Series")).toBeTruthy();
    expect(screen.getByText("Title", { exact: false })).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <SeriesSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.toJSON()).toBeNull();
  });
});
