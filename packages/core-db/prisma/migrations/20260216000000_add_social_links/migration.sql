-- Add social links columns to Scholar table
ALTER TABLE "Scholar" ADD COLUMN IF NOT EXISTS "socialTwitter" TEXT;
ALTER TABLE "Scholar" ADD COLUMN IF NOT EXISTS "socialTelegram" TEXT;
ALTER TABLE "Scholar" ADD COLUMN IF NOT EXISTS "socialYoutube" TEXT;
ALTER TABLE "Scholar" ADD COLUMN IF NOT EXISTS "socialWebsite" TEXT;
