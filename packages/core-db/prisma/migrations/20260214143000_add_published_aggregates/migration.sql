-- Add precomputed aggregates for fast browsing/featured rendering

ALTER TABLE "Collection"
ADD COLUMN IF NOT EXISTS "publishedLectureCount" INTEGER,
ADD COLUMN IF NOT EXISTS "publishedDurationSeconds" INTEGER;

ALTER TABLE "Series"
ADD COLUMN IF NOT EXISTS "publishedLectureCount" INTEGER,
ADD COLUMN IF NOT EXISTS "publishedDurationSeconds" INTEGER;
