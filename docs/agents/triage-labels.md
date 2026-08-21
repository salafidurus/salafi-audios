# Triage labels

The engineering skills use five canonical triage roles. This table maps each role to the label used in this repository's GitHub issue tracker.

| Label in Matt Pocock skills | Label in this repository | Meaning                                  |
| --------------------------- | ------------------------ | ---------------------------------------- |
| `needs-triage`              | `needs-triage`           | Maintainer needs to evaluate this issue  |
| `needs-info`                | `needs-info`             | Waiting on reporter for more information |
| `ready-for-agent`           | `ready-for-agent`        | Fully specified, ready for an AFK agent  |
| `ready-for-human`           | `ready-for-human`        | Requires human implementation            |
| `wontfix`                   | `wontfix`                | Will not be actioned                     |

When a skill names a triage role, use the corresponding repository label from the right-hand column. Edit that column if the GitHub label vocabulary changes.

## Artifact labels

Generated work items also carry an artifact label so they can be filtered independently of triage state:

| Artifact      | Repository label | Applied by   |
| ------------- | ---------------- | ------------ |
| Specification | `spec`           | `to-spec`    |
| Ticket        | `ticket`         | `to-tickets` |
