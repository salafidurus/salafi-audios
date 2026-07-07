import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SessionSheet } from "./SessionSheet";

jest.mock("@/features/admin/api/admin-live.api", () => ({
  createSession: jest.fn(),
}));

describe("SessionSheet", () => {
  it("renders session form with channel list when open", async () => {
    await render(
      <SessionSheet
        isOpen={true}
        channels={[
          { id: "ch1", displayName: "Channel One", isActive: true, createdAt: "", updatedAt: "" },
        ]}
        onClose={() => {}}
        onSaved={() => {}}
      />,
    );
    expect(screen.getByText("New Session")).toBeTruthy();
    expect(screen.getByText("Channel One")).toBeTruthy();
  });

  it("renders nothing when closed", async () => {
    await render(
      <SessionSheet isOpen={false} channels={[]} onClose={() => {}} onSaved={() => {}} />,
    );
    expect(screen.toJSON()).toBeNull();
  });
});
