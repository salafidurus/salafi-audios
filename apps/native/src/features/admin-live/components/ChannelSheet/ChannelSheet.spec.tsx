import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ChannelSheet } from "./ChannelSheet";

jest.mock("@/features/admin-live/api/admin-live.api", () => ({
  createChannel: jest.fn(),
  updateChannel: jest.fn(),
}));

describe("ChannelSheet", () => {
  it("renders channel form with all helper texts when open", async () => {
    await render(<ChannelSheet isOpen={true} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.getByText("Telegram ID", { exact: false })).toBeTruthy();
    expect(screen.getByText("@userinfobot", { exact: false })).toBeTruthy();
    expect(screen.getByText("Display Name", { exact: false })).toBeTruthy();
    expect(screen.getByText("Telegram Slug")).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(<ChannelSheet isOpen={false} onClose={() => {}} onSaved={() => {}} />);
    expect(screen.toJSON()).toBeNull();
  });
});
