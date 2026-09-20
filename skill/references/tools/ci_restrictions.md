# `ci_restrictions`

Local GitHub Actions jobs, steps, literal checks, and their evidence limits.
It never runs a workflow or reads remote merge protection.

## When to use

Identify configured CI checks and ask whether a known event, base branch, and
changed path would enter a workflow. `UNDETERMINED` is returned for dynamic
conditions, scripts, or unavailable action bodies.

## Inputs

- `scope`: optional workflow-path substring.
- `scenario`: optional object with `event`, `branch` (PR base branch), and
  `changed_files` (array of repository paths). Do not pass secrets.
- `max_results` and `token_budget`: response bounds.
- `output_format` and `expected_repository`: common MCP arguments.

## Minimal call

```json
{"name":"ci_restrictions","arguments":{"scenario":{"event":"pull_request","branch":"main","changed_files":["src/lib.rs"]},"output_format":"text"}}
```

The response separates declaration, applicability, observed execution,
failure effect, and remote enforcement. A configured coverage threshold is
not measured coverage. The live MCP `tools/list` schema is authoritative.
