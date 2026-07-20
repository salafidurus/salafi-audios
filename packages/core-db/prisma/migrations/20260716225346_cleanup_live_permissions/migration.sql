-- Data migration: remove orphaned LIVE_* permission rows before
-- the enum type transition in the subsequent migration
DELETE FROM "UserPermission" WHERE permission::text LIKE 'LIVE_%';
