import React from "react";
import renderer, { act } from "react-test-renderer";
import { ChannelSheet } from "./ChannelSheet";

jest.mock("@/features/admin-live/api/admin-live.api", () => ({
  createChannel: jest.fn(),
  updateChannel: jest.fn(),
}));

describe("ChannelSheet", () => {
  it("renders channel form with all helper texts when open", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<ChannelSheet isOpen={true} onClose={() => {}} onSaved={() => {}} />);
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("Telegram ID");
    expect(rendered).toContain("@userinfobot");
    expect(rendered).toContain("Display Name");
    expect(rendered).toContain("Telegram Slug");
  });

  it("renders nothing when closed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(<ChannelSheet isOpen={false} onClose={() => {}} onSaved={() => {}} />);
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
