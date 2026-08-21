# Issue tracker: GitHub

Issues and specs for this repository live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply or remove labels**: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- **Close an issue**: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** Set this to `yes` if external pull requests should enter the triage queue.

When enabled, pull requests run through the same labels and states as issues:

- **Read a pull request**: `gh pr view <number> --comments` and `gh pr diff <number>`.
- **List external pull requests**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`, keeping only `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` author associations.
- **Comment, label, or close**: use `gh pr comment`, `gh pr edit --add-label` or `--remove-label`, and `gh pr close`.

GitHub shares one number space across issues and pull requests, so resolve an ambiguous `#<number>` with `gh pr view <number>` and fall back to `gh issue view <number>`.

## Skill operations

- When a skill says **publish to the issue tracker**, create a GitHub issue.
- When a skill says **fetch the relevant ticket**, run `gh issue view <number> --comments`.

## Generated ticket dependencies

When `to-tickets` publishes GitHub issues, it must preserve the approved
dependency matrix in two places: each issue's `Blocked by` section and GitHub's
native issue dependency graph. After publication, audit every generated issue
with `gh api repos/<owner>/<repo>/issues/<number>/dependencies/blocked_by`.
Implementation order alone is not a blocker unless the approved breakdown says
the dependent ticket cannot start without the preceding ticket.

## Wayfinding operations

The map is one issue labelled `wayfinder:map`; its child issues are the tickets.

- **Map**: keep Notes, Decisions-so-far, and Fog in the issue body.
- **Child ticket**: use a GitHub sub-issue through `gh api`. If sub-issues are unavailable, add the child to a task list in the map and put `Part of #<map>` at the top of the child body. Label it `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- **Blocking**: prefer GitHub's native issue dependencies. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where the blocker database ID comes from `gh api repos/<owner>/<repo>/issues/<number> --jq .id`. If dependencies are unavailable, put `Blocked by: #<number>` at the top of the child body.
- **Frontier query**: list the map's open children, drop children with an open blocker or assignee, and select the first remaining child in map order.
- **Claim**: assign the selected child to the driving developer with `gh issue edit <number> --add-assignee @me`; claiming is the session's first write.
- **Resolve**: comment with the result, close the child, and append its context pointer to the map's Decisions-so-far.
