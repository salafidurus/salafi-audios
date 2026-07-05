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
  it("collapses default settings tab to /settings", () => {
    expect(buildSectionTabPath("settings")).toBe("/settings");
    expect(buildSectionTabPath("settings", "general")).toBe("/settings");
  });
  it("appends non-default settings tab", () => {
    expect(buildSectionTabPath("settings", "profile")).toBe("/settings/profile");
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
