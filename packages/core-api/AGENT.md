# `@sd/core-api` guidance

This package owns platform-agnostic API client infrastructure. Keep request
helpers, interceptors, initialization, and package-local types here; feature
queries and domain behavior belong in `@sd/domain-*`.

`src/index.ts` is the public entrypoint. Exports are explicit, intermediate
barrels are avoided, and every direct external import is declared by the
package.
