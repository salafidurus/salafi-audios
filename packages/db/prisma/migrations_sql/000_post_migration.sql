-- packages/db/prisma/migrations_sql/000_post_migration.sql

-- 1) Partial unique index: ensure at most one primary asset per lecture
CREATE UNIQUE INDEX IF NOT EXISTS uq_audioasset_lecture_primary
  ON "AudioAsset" ("lectureId")
  WHERE isPrimary;

-- 2) Full-text search setup: single trigger function to populate search_vector
CREATE OR REPLACE FUNCTION public.update_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$;

-- 3) Add search_vector and index for Lecture
ALTER TABLE "Lecture" ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE "Lecture"
SET search_vector = to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''));
CREATE INDEX IF NOT EXISTS idx_lecture_search_vector ON "Lecture" USING GIN (search_vector);

-- Trigger for Lecture
DROP TRIGGER IF EXISTS trg_lecture_search_vector ON "Lecture";
CREATE TRIGGER trg_lecture_search_vector
BEFORE INSERT OR UPDATE ON "Lecture"
FOR EACH ROW EXECUTE PROCEDURE public.update_search_vector();

-- 4) Add search_vector and index for Series
ALTER TABLE "Series" ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE "Series"
SET search_vector = to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''));
CREATE INDEX IF NOT EXISTS idx_series_search_vector ON "Series" USING GIN (search_vector);

-- Trigger for Series
DROP TRIGGER IF EXISTS trg_series_search_vector ON "Series";
CREATE TRIGGER trg_series_search_vector
BEFORE INSERT OR UPDATE ON "Series"
FOR EACH ROW EXECUTE PROCEDURE public.update_search_vector();

-- 5) Add search_vector and index for Collection
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE "Collection"
SET search_vector = to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''));
CREATE INDEX IF NOT EXISTS idx_collection_search_vector ON "Collection" USING GIN (search_vector);

-- Trigger for Collection
DROP TRIGGER IF EXISTS trg_collection_search_vector ON "Collection";
CREATE TRIGGER trg_collection_search_vector
BEFORE INSERT OR UPDATE ON "Collection"
FOR EACH ROW EXECUTE PROCEDURE public.update_search_vector();

-- 6) Prevent deleting the last audio asset for a lecture
-- This trigger throws an error if a DELETE would leave zero assets for the lecture.
CREATE OR REPLACE FUNCTION public.guard_audioasset_delete() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  remaining_count int;
BEGIN
  SELECT count(*) INTO remaining_count FROM "AudioAsset" WHERE "lectureId" = OLD."lectureId" AND id != OLD.id;
  IF remaining_count <= 0 THEN
    RAISE EXCEPTION 'Cannot delete the last audio asset for lecture %; delete the lecture instead', OLD."lectureId";
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_audioasset_delete ON "AudioAsset";
CREATE TRIGGER trg_guard_audioasset_delete
BEFORE DELETE ON "AudioAsset"
FOR EACH ROW EXECUTE PROCEDURE public.guard_audioasset_delete();
