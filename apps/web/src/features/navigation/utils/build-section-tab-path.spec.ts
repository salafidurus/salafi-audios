import { buildSectionTabPath } from "./get-current-section";

describe("buildSectionTabPath", () => {
  it("collapses default explore tab to /explore", () => {
    expect(buildSectionTabPath("explore")).toBe("/explore");
    expect(buildSectionTabPath("explore", "popular")).toBe("/explore");
  });
  it("appends non-default explore tab", () => {
    expect(buildSectionTabPath("explore", "recent")).toBe("/explore/recent");
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
});
