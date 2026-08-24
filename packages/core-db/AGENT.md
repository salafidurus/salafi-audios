# `@sd/core-db` guidance

This package owns the Prisma schema, migrations, database client, and database
scripts consumed by `apps/api`.

The Prisma schema and migrations are authoritative. Never hand-edit generated
client output; regenerate it from the schema. Store relational authoritative
state here, not media blobs, analytics streams, or UI state. Keep environment
values out of source and migrations.
