# `find_dead_code`

Conservative unreferenced-symbol review queue.

## When to use

Build a conservative dead-code review queue with entry-point, test, config, dynamic, and external-use evidence.

Never delete from this result alone; confirm source and framework registration points.

## Inputs

- `include_classified` (boolean).
- `include_tests` (boolean).
- `kinds` (array<string>).
- `min_confidence` (integer, min 0, max 100).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `path` (string).
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "find_dead_code",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
