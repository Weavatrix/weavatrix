# `agent_change_impact`

Compare two supplied MCP catalog snapshots and report contract changes,
adapter compensation, and declared consumers.

## When to use

After adding `before` and `after` catalog JSON files to the repository. A
known inject transform can keep one exposure compatible while the upstream
required list grew. Incomplete pagination is not a deletion. Verdicts are
a supported-subset proof: unsupported keywords stay `undetermined`. A
boolean `enum: [true, false]` is not a restriction. `integer` to
`number` is a widening. Duplicate tool labels are `ambiguous-identity`.
Skill hits are declared `allowed-tools`, not proven calls.

## Inputs

- `before` (string, required) — repository-relative previous catalog snapshot.
- `after` (string, required) — repository-relative current catalog snapshot.
- `max_results` (number, optional) — change page size, 1–500, default 100.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "agent_change_impact",
  "arguments": {
    "before": "catalogs/before.json",
    "after": "catalogs/after.json",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
