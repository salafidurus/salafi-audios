# `@sd/core-sync` guidance

This package owns the platform-agnostic local-first store, tombstones, outbox,
conflict resolution, and sync engine used by domain packages.

Keep feature semantics in consuming domains. Storage is dependency-injected via
`StorageAdapter`; do not add platform-specific storage implementations or
platform entrypoints here. Keep production and test-utils entrypoints separate
and exports explicit.
