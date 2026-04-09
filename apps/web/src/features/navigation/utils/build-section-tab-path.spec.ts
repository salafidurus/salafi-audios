import { buildSectionTabPath } from "./get-current-section";

describe("buildSectionTabPath", () => {
  it("collapses default feed tab to /feed", () => {
    expect(buildSectionTabPath("feed")).toBe("/feed");
    expect(buildSectionTabPath("feed", "popular")).toBe("/feed");
  });
  it("appends non-default feed tab", () => {
    expect(buildSectionTabPath("feed", "recent")).toBe("/feed/recent");
  });
  it("collapses default library tab to /library", () => {
    expect(buildSectionTabPath("library")).toBe("/library");
    expect(buildSectionTabPath("library", "started")).toBe("/library");
  });
  it("appends non-default library tab", () => {
    expect(buildSectionTabPath("library", "saved")).toBe("/library/saved");
  });
  it("collapses default account tab to /account", () => {
    expect(buildSectionTabPath("account")).toBe("/account");
    expect(buildSectionTabPath("account", "general")).toBe("/account");
  });
  it("appends non-default account tab", () => {
    expect(buildSectionTabPath("account", "profile")).toBe("/account/profile");
  });
  it("collapses default live tab (ongoing) to /live", () => {
    expect(buildSectionTabPath("live")).toBe("/live");
    expect(buildSectionTabPath("live", "ongoing")).toBe("/live");
  });
  it("appends non-default live tab (scheduled)", () => {
    expect(buildSectionTabPath("live", "scheduled")).toBe("/live/scheduled");
  });
  it("appends non-default live tab (ended)", () => {
    expect(buildSectionTabPath("live", "ended")).toBe("/live/ended");
  });
});
