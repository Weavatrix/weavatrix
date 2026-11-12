# `verified_change`

Composite pre-commit evidence and conservative verdict.

## When to use

Produce one conservative plan or verify envelope combining impact, architecture, duplicate, API, and optional test evidence. `impact_depth` and `max_impact_nodes` bound the embedded blast radius. Selected symbols are compact nodes. Data-flow edges are source, target, kind, and, when present, coupling and the call line. Each edit context keeps at most 8 relationship rows.

Use the same `task` and base revision in `phase:"plan"` and `phase:"verify"`.

## Inputs

- `task` (string, required).
- `api_contract` (object).
- `base_ref` (string).
- `data_flow_depth` (integer, min 0).
- `diff` (string).
- `duplicate_ratchet` (boolean).
- `files` (array<string>).
- `head_ref` (string).
- `impact_depth` (integer, min 0).
- `max_data_flow_edges` (integer, min 0).
- `max_impact_nodes` (integer, min 0).
- `max_symbols` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `phase` ("plan" | "verify").
- `precision` (string).
- `run_tests` (boolean).
- `test_timeout_ms` (integer, min 0).
- `tests` (array<string>).

## Minimal call

```json
{
  "name": "verified_change",
  "arguments": {
    "task": "<task>",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
