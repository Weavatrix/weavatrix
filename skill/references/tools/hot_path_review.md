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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
