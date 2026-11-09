# `read_source`

Bounded source context by node or repository path.

## When to use

Read an exact verified line range after a file and location are known.

## Inputs

- `after` (integer, min 0).
- `before` (integer, min 0).
- `label` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `path` (string).
- `start_line` (integer, min 0).
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "read_source",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
