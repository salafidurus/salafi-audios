# `infra/catalog` guidance

The catalog tool synchronizes workspace dependency versions with the root
catalog configuration. `catalog.config.json` owns group assignments and group
order is authoritative.

Keep reality-to-config and config-to-reality operations distinct. Skip internal
`@sd/*` and `workspace:` dependencies. Normalize workspace paths with `/` and
preserve existing groups when adding conflict groups.

Catalog behavior is tested with isolated temporary fixtures. Keep scanner
changes test-first.
