# Implementation Start

Run this handoff after an approved plan exists and before editing or creating
the implementation checkout.

1. Invoke `triage` for the implementation issue.
2. Verify the issue has one category role, one artifact label, and an approved
   state transition from `ready-for-agent` (or an explicitly approved
   `ready-for-human`) to `in-progress`.
3. Preserve the parent specification and its `spec/<slug>` integration target.
4. Stop before checkout or source changes if the transition is missing,
   conflicting, or unverifiable.

This handoff changes tracker state; it is distinct from the read-only
`pre-implement` readiness check. If no implementation issue exists, record
that the handoff is not applicable.
