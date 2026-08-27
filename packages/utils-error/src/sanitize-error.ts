/**
 * Sanitize error messages to show user-friendly messages instead of technical details.
 * Prevents exposing system information, API details, or implementation specifics.
 * Used across web and native apps for consistent error messaging.
 *
 * @param error - The error message or Error object
 * @returns A user-friendly error message suitable for end users
 */
export function sanitizeError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : String(cause);
  const parsedMessage = parseStructuredMessage(message);
  if (parsedMessage) return parsedMessage;

  const matchedMessage = matchKnownError(message);
  if (matchedMessage) return matchedMessage;

  return getSafeShortMessage(message) ?? "Something went wrong. Please try again.";
}

function parseStructuredMessage(message: string): string | undefined {
  // Check for JSON block in the message (e.g. from NestJS validation filters)
  const jsonStartIdx = message.indexOf("{");
  if (jsonStartIdx !== -1) {
    try {
      const jsonStr = message.substring(jsonStartIdx);
      const parsed = JSON.parse(jsonStr);

      if (parsed.message === "Validation failed" && Array.isArray(parsed.details)) {
        return parsed.details
          .map((d: any) => {
            // Join path array to form full dot-notation path
            const field = Array.isArray(d.path) ? d.path.join(".") : "";
            return `${field ? `${field}: ` : ""}${d.message}`;
          })
          .join(", ");
      }

      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // Ignore JSON parse errors and proceed to pattern matching
    }
  }

  return undefined;
}

function matchKnownError(message: string): string | undefined {
  const patterns: Array<[RegExp, string]> = [
    // Network/API errors
    [
      /network|offline|connection|unreachable|ECONNREFUSED|ETIMEDOUT/i,
      "Unable to connect. Please check your internet connection.",
    ],
    [
      /failed to fetch|fetch error|api.*unavailable/i,
      "Service temporarily unavailable. Please try again later.",
    ],
    [/401|unauthorized/i, "Your session expired. Please sign in again."],
    [/403|forbidden/i, "You don't have access to perform this action."],
    [/400|validation|invalid data/i, "Invalid input. Please check your entries."],
    [/404|not found|does not exist/i, "Item not found."],
    [/500|server error|internal error/i, "Server error. Please try again later."],
    [/timeout|took too long/i, "Request took too long. Please try again."],
  ];

  // Check if message matches any pattern
  for (const [pattern, userMessage] of patterns) {
    if (pattern.test(message)) {
      return userMessage;
    }
  }

  return undefined;
}

function getSafeShortMessage(message: string): string | undefined {
  if (message.length > 0 && message.length < 50) {
    // If the error is short and doesn't contain technical jargon, use it
    if (!/^[A-Z]+_|code:|Error:|at |function /.test(message)) {
      return message;
    }
  }

  return undefined;
}
