-- Existing Better Auth accounts were created before issuer was introduced.
-- Backfill the issuer used by the OAuth providers so account lookup does not
-- miss the legacy row and then collide with (providerId, accountId).
UPDATE "Account"
SET "issuer" = CASE "providerId"
  WHEN 'google' THEN 'https://accounts.google.com'
  WHEN 'apple' THEN 'https://appleid.apple.com'
  ELSE "issuer"
END
WHERE "issuer" = ''
  AND "providerId" IN ('google', 'apple');
