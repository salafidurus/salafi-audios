-- Topics: Arabic is now the main language (Topic.name), English moves to
-- an optional TopicTranslation. Reconcile existing rows, which were
-- authored with English as the main language:
--
-- 1. Preserve every existing topic's current (English) name as an English
--    translation, unless one already exists.
INSERT INTO "TopicTranslation" (id, "topicId", locale, name, "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, t.id, 'en', t.name, now(), now()
FROM "Topic" t
WHERE NOT EXISTS (
  SELECT 1 FROM "TopicTranslation" tt WHERE tt."topicId" = t.id AND tt.locale = 'en'
);

-- 2. Where an Arabic translation already exists, promote it to become the
--    new base name.
UPDATE "Topic" t
SET name = tt.name
FROM "TopicTranslation" tt
WHERE tt."topicId" = t.id AND tt.locale = 'ar';

-- 3. Drop the now-redundant Arabic translation rows (base holds it now).
DELETE FROM "TopicTranslation" WHERE locale = 'ar';