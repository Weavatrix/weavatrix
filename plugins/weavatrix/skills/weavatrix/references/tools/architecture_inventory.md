# `architecture_inventory`

Observed package, component, and typed edge evidence. No style label or
target architecture is inferred.

## When to use

Orient in an unfamiliar repository or compare observed structure with a
separately declared architecture contract.

## Inputs

- `output_format` (`text`, `json`, or `structured`).
- `expected_repository` (optional active-root guard).

## Minimal call

```json
{"name":"architecture_inventory","arguments":{"output_format":"text"}}
```

The live MCP `tools/list` schema is authoritative.
