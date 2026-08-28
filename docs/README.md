# Documentation

This directory is the repository’s durable documentation. Put new material in
the closest existing category; do not add loose files at the `docs/` root
without updating this index.

## Categories

- [`product/`](product/): product requirements and non-goals
- [`architecture.md`](architecture.md): complete platform map
- [`adr/`](adr/): durable architectural decisions
- [`clients/`](clients/): web and mobile architecture
- [`backend/`](backend/): API boundaries and contracts
- [`data/`](data/): database, storage, and synchronization
- [`security/`](security/): authentication and session boundaries
- [`administration/`](administration/): roles, grants, and break-glass access
- [`content/`](content/): canonical content vocabulary
- [`policies/`](policies/): rules that govern development and delivery
- [`runbooks/`](runbooks/): repeatable operational procedures

Key policies:

- [`Dependency automation`](policies/dependency-automation.md): ownership
  boundaries for Dependabot and Dependabot Helper

## Reading order

1. [`../AGENT.md`](../AGENT.md)
2. [`AGENT.md`](AGENT.md)
3. [`product/requirements.md`](product/requirements.md)
4. [`architecture.md`](architecture.md)
5. The document for the area being changed
6. The target workspace `AGENT.md`

`AGENT.md` files contain agent and contributor guidance. The other documents
describe the product and system. Keep those responsibilities separate.
