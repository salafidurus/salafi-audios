# Readiness Check

This is the read-only lifecycle gate before planning one implementation ticket.

- The issue must have exactly one category role and one state role.
- Its state must be `ready-for-agent`.
- A specification ticket must resolve its parent specification and recorded
  `spec/<slug>` branch. Missing branch metadata is reported as a warning and
  uses the provisional routing defined by `SKILL.md`.
- A standalone ticket uses `origin/main` as its base and `main` as its PR
  target.
- Conflicting labels, missing parent context, or an incomplete ticket stops
  planning and returns the issue to `triage`.

Do not add or remove labels, close issues, post comments, create branches, or
modify files during this check.
