# Domain docs

How engineering skills consume domain documentation while exploring this monorepo.

## Read order

Before exploring a context, read:

1. `docs/README.md` and `docs/architecture.md` for system intent and boundaries.
2. Root `AGENT.md`, then the nearest directory-local `AGENT.md` for contributor behavior.
3. Root `CONTEXT-MAP.md`, when present, and each linked `CONTEXT.md` relevant to the work.
4. Relevant system-wide ADRs under root `docs/adr/` and context-specific ADRs beside the selected `CONTEXT.md`.

If a context map, context file, or ADR directory does not exist, proceed silently. Domain-modeling workflows create these files lazily when terminology or architectural decisions are resolved.

## Multi-context layout

This repository uses a multi-context layout. The root map locates context documentation; it does not replace the architecture index or contributor rules.

```text
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                         # System-wide decisions
├── apps/
│   ├── api/
│   │   ├── CONTEXT.md              # Create when API domain context is modeled
│   │   └── docs/adr/               # API-context decisions
│   ├── web/
│   │   ├── CONTEXT.md              # Create when web context needs a glossary
│   │   └── docs/adr/
│   └── native/
│       ├── CONTEXT.md              # Create when native context needs a glossary
│       └── docs/adr/
└── packages/
    └── <domain-context>/
        ├── CONTEXT.md              # Create for independently modeled contexts
        └── docs/adr/
```

Not every workspace needs a `CONTEXT.md`. Add one only when the workspace owns distinct domain vocabulary or decisions; shared system decisions stay in root `docs/adr/`.

## Vocabulary

Use terms from the relevant `CONTEXT.md` when naming issues, proposals, hypotheses, and tests. Repository-wide content vocabulary remains authoritative in `docs/content/nomenclature.md`; context glossaries refine it without redefining Collection, Series, Single, Module, or Lesson.

If a needed concept is absent, first check existing code and documentation for the established term. Record a genuine gap for a domain-modeling workflow rather than inventing a synonym.

## ADR conflicts

Surface conflicts with existing ADRs explicitly instead of silently overriding them. Identify the ADR and explain why the decision may need to be reopened.
