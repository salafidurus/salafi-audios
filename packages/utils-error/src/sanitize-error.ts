/**
 * Sanitize error messages to show user-friendly messages instead of technical details.
 * Prevents exposing system information, API details, or implementation specifics.
 * Used across web and native apps for consistent error messaging.
 *
 * @param error - The error message or Error object
 * @returns A user-friendly error message suitable for end users
 */
export function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // Map specific error patterns to user-friendly messages
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
    [/403|forbidden/i, "You don't have permission to perform this action."],
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

  // For unknown errors, return a generic message
  if (message && message.length > 0 && message.length < 50) {
    // If the error is short and doesn't contain technical jargon, use it
    if (!/^[A-Z]+_|code:|Error:|at |function /.test(message)) {
      return message;
    }
  }

  return "Something went wrong. Please try again.";
}
