-- Enforce exactly ONE primary audio asset per lecture
CREATE UNIQUE INDEX IF NOT EXISTS "uq_audioasset_lecture_primary"
ON "AudioAsset" ("lectureId")
WHERE ("isPrimary" = true);
