# Ponytail — Laziness Enforcement and Code Hygiene

Ponytail mode enforces YAGNI: the best code is code never written. These skills sharpen that into targeted actions.

## When to invoke

- **After any implementation** — run `ponytail:ponytail-review` before marking work complete. It spots over-engineering, unnecessary abstractions, and code that should not exist.
- **A code area feels bloated** — run `ponytail:ponytail-audit` to find what can be deleted.
- **Before committing a deliberate shortcut** — run `ponytail:ponytail-debt` to identify what needs a `// ponytail:` comment explaining the ceiling and upgrade path.
- **Measuring a simplification's value** — run `ponytail:ponytail-gain` to quantify token or complexity savings.

## Skill invocations (via Skill tool)

| Skill                      | When                                                    |
| -------------------------- | ------------------------------------------------------- |
| `ponytail:ponytail-review` | After writing code — check for unnecessary complexity   |
| `ponytail:ponytail-audit`  | Investigate a bloated area — find what to delete        |
| `ponytail:ponytail-debt`   | Before committing — surface shortcuts needing a comment |
| `ponytail:ponytail-gain`   | Measure savings from a proposed simplification          |

## Note

When the session hook fires `PONYTAIL MODE ACTIVE`, the full ponytail ladder applies session-wide. These skill invocations are targeted actions within that mode — use them at the right moments rather than only relying on passive awareness.
