-- Enable trigram search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for collections
CREATE INDEX IF NOT EXISTS idx_collection_title_trgm
  ON "Collection" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_collection_description_trgm
  ON "Collection" USING GIN ("description" gin_trgm_ops);

-- Trigram indexes for series
CREATE INDEX IF NOT EXISTS idx_series_title_trgm
  ON "Series" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_series_description_trgm
  ON "Series" USING GIN ("description" gin_trgm_ops);

-- Trigram indexes for lectures
CREATE INDEX IF NOT EXISTS idx_lecture_title_trgm
  ON "Lecture" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lecture_description_trgm
  ON "Lecture" USING GIN ("description" gin_trgm_ops);
