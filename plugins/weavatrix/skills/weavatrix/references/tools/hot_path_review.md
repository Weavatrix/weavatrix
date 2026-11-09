# `hot_path_review`

Rank high-connectivity and large source symbols.

## When to use

Rank static performance-review candidates using connectivity and change signals.

## Inputs

- `call_threshold` (string).
- `cyclomatic_threshold` (string).
- `include_classified` (boolean).
- `include_tests` (boolean).
- `loop_depth_threshold` (integer, min 0).
- `min_score` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `path` (string).
- `time_rank_threshold` (string).
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "hot_path_review",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
