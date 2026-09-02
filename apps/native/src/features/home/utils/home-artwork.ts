/** Home-specific artwork selection utilities for listing and scholar surfaces. */

/**
 * Selects the first usable artwork URL for a Home listing or scholar avatar.
 *
 * The listing artwork must take precedence over the scholar artwork, while
 * null, undefined, and whitespace-only values are treated as unavailable.
 * The function has no side effects and returns undefined when neither source
 * can provide an image.
 */
export function resolveHomeAvatarImage(
  primary?: string | null,
  secondary?: string | null,
): string | undefined {
  return [primary, secondary].find((image) => Boolean(image?.trim())) ?? undefined;
}
