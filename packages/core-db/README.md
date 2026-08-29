# `@sd/core-db` development

`bun run dev:api+web` watches the hand-written `@sd/core-db` source and Prisma
schema. The package's development build regenerates `src/generated/prisma`,
writes `dist`, and uses `.generated-prisma.lock` to serialize concurrent
generation. Those build-owned artifacts are excluded from the development
watch inputs so the build does not retrigger itself.
