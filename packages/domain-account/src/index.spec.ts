import { domainAccountVersion } from "./index";

describe("domain-account", () => {
  it("exports a version string", () => {
    expect(typeof domainAccountVersion).toBe("string");
  });
});
