# `architecture_inventory`

Observed package, nested component, declared-membership, and typed edge
evidence. The default is a bounded architecture overview, not a raw graph
dump. No style label or target architecture is inferred.

## When to use

Orient in an unfamiliar repository or compare observed structure with a
separately declared architecture contract.

Component identities distinguish paths that sanitize alike, including the
repository root. Files can retain every matching declared membership. Edge
totals and component SCC/cycle witnesses are computed before presentation
limits, and each recovered fact keeps its immutable source evidence. A cycle in
the component quotient is reported as architecture, not as symbol recursion.

## Inputs

- `detail`: `summary` (default) or `full`.
- `max_results` (1–500) and `edge_cursor`: page edges in `full` mode. Supplying
  either without `detail` implies `full`; neither shrinks the summary.
- `token_budget`: additional output ceiling; may drop samples or evidence.
- `output_format` (`text`, `json`, or `structured`) changes only the MCP
  representation. `text` still contains serialized JSON, not prose.
- `expected_repository` (optional active-root guard).

## Minimal call

```json
{"name":"architecture_inventory","arguments":{}}
```

Turn the returned packages, component paths, dominant coupling, and complete
edge/cycle-candidate totals into a concise answer in your own words. Never
present a quotient/union cycle candidate as a proven executable cycle. Ask
for `{"detail":"full"}` only to inspect a specific edge, component, or
cycle witness. The full response can be large and paginates edges.

The live MCP `tools/list` schema is authoritative.
