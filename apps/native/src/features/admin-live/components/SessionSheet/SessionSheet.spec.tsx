import React from "react";
import renderer, { act } from "react-test-renderer";
import { SessionSheet } from "./SessionSheet";

jest.mock("@/features/admin-live/api/admin-live.api", () => ({
  createSession: jest.fn(),
}));

describe("SessionSheet", () => {
  it("renders session form with channel list when open", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SessionSheet
          isOpen={true}
          channels={[
            { id: "ch1", displayName: "Channel One", isActive: true, createdAt: "", updatedAt: "" },
          ]}
          onClose={() => {}}
          onSaved={() => {}}
        />,
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain("New Session");
    expect(rendered).toContain("Channel One");
  });

  it("renders nothing when closed", () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SessionSheet isOpen={false} channels={[]} onClose={() => {}} onSaved={() => {}} />,
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
