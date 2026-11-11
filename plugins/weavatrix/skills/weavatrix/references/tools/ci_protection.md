# `ci_protection`

Bind an explicit file list to local CI checks and declared architecture rules.
It does not run a workflow, read the git diff, or ride along on `change_impact`,
`graph_diff`, `verified_change`, or `prepare_change`.

## When to use

After you already know the paths, ask which configured checks and declared
rules are candidates for those paths. For the full restriction inventory,
call `ci_restrictions`. For one finding, call `explain_restriction`.

## Inputs

- `files` (required): repository paths. The call does not discover them.
- `output_format` and `expected_repository`: common MCP arguments.

## Minimal call

```json
{"name":"ci_protection","arguments":{"files":["src/lib.rs"],"output_format":"structured"}}
```

`candidate_checks` and `declared_rule_bindings` are static candidates.
Component and build membership in the answer are path labels
(`component:directory:src/api`, `test:architecture`, `Cargo.toml`), not
repository hashes. `restrictions_unresolved` returns at most 20 strings and
`restrictions_unresolved_total` is the full count. Execution, path filters,
and remote enforcement are not proven. The live MCP `tools/list` schema is
authoritative.
