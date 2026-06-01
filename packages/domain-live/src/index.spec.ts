import { domainLiveVersion } from "./index";

describe("domain-live", () => {
  it("exports a version string", () => {
    expect(typeof domainLiveVersion).toBe("string");
  });
});
