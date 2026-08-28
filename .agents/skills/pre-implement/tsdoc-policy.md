# TSDoc planning policy

Documentation is part of the implementation contract. During planning, identify
where a change alters something another developer, package, route, or caller
must understand.

## Find documentation seams

Read the implementation and tests before planning comments. Look for exported
functions, classes, hooks, components, types, and interfaces; API clients and
DTO boundaries; state machines and reducers; adapters; route, authentication,
localization, and persistence boundaries; and semantic fields such as `status`,
`state`, `slug`, `source`, `error`, `userId`, and lifecycle timestamps.

Do not plan comments for every local variable. Plan documentation where the
behavior, invariant, side effect, or failure mode is part of the contract.

## Plan from behavior

Weak planning names a file without identifying the contract:

```markdown
- Add comments to the upload code.
```

Useful planning names the behavior that needs to remain understandable:

```markdown
- Document `UploadArrangePhase` transitions, including which failures return
  the workflow to editing.
- Document that `conflictSlugs` preserves server-rejected identities for
  correction rather than treating a commit conflict as a generic error.
- Document that `buildCommitDto` emits the atomic payload for the staged tree
  and does not perform the network request itself.
```

For each seam, answer what callers rely on, which inputs are authoritative, what
invariants must survive refactoring, what side effects occur, and which failures
are expected or recoverable. Record unanswered questions as plan risks.
