# `explain_restriction`

Retrieve one local restriction by the ID returned from `ci_restrictions`.

## When to use

Inspect its source digest and byte span, invocation, applicability, failure
effect, and unknowns before making a change.

## Inputs

- `id` (required): exact restriction ID.
- `scenario`: optional `event`, `branch`, and `changed_files` object.
- `output_format` and `expected_repository`: presentation and active-root guard.

## Minimal call

```json
{"name":"explain_restriction","arguments":{"id":".github/workflows/ci.yml/quality/3/rustfmt_check/1","output_format":"text"}}
```

The live MCP `tools/list` schema is authoritative.
