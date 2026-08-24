# `verified_change`

Composite pre-commit evidence and conservative verdict.

## When to use

Produce one conservative plan or verify envelope combining impact, architecture, duplicate, API, and optional test evidence.

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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
