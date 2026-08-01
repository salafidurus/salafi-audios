-- Data migration: convert existing full country names to ISO codes
UPDATE "Scholar"
SET "country" = 'SA'
WHERE "country" = 'Saudi Arabia';

UPDATE "Scholar"
SET "country" = 'YE'
WHERE "country" = 'Yemen';

-- Change default from 'Saudi Arabia' to 'SA'
ALTER TABLE "Scholar"
ALTER COLUMN "country" SET DEFAULT 'SA';
