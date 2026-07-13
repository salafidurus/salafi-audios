import { describe, it, expect } from "vitest";
import { sanitizeError } from "./sanitize-error";

describe("sanitizeError validation parser", () => {
  it("parses single validation error", () => {
    const errorJson = JSON.stringify({
      message: "Validation failed",
      details: [
        {
          path: ["email"],
          message: "Invalid email address",
        },
      ],
    });
    const errorStr = `Error: validation occurred: ${errorJson}`;
    expect(sanitizeError(errorStr)).toBe("email: Invalid email address");
  });

  it("parses multiple validation errors and formats with dot-notation path", () => {
    const errorJson = JSON.stringify({
      message: "Validation failed",
      details: [
        {
          path: ["user", "profile", "firstName"],
          message: "First name is too short",
        },
        {
          path: ["user", "email"],
          message: "Email is required",
        },
      ],
    });
    const errorStr = `Validation failed with payload ${errorJson}`;
    expect(sanitizeError(errorStr)).toBe(
      "user.profile.firstName: First name is too short, user.email: Email is required",
    );
  });

  it("parses general NestJS error JSON with message property", () => {
    const errorJson = JSON.stringify({
      statusCode: 400,
      message: "Custom bad request error description",
      error: "Bad Request",
    });
    expect(sanitizeError(errorJson)).toBe("Custom bad request error description");
  });

  it("falls back to original patterns if JSON parsing fails or is not present", () => {
    expect(sanitizeError("Failed to fetch data from API")).toBe(
      "Service temporarily unavailable. Please try again later.",
    );
  });
});
