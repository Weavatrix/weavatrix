# `find_dead_code`

Conservative unreferenced-symbol review queue.

## When to use

Build a conservative dead-code review queue. Every `main.go` and every Go `func main` is an entry, so `main` itself is reachable. Receiver names and function-literal parameters are not symbols. Exported symbols with no callers stay at confidence 50; private ones at 85. `REVIEW_ONLY` means the queue is a review list.

Never delete from this result alone; confirm source and framework registration points.

## Inputs

- `include_classified` (boolean).
- `include_tests` (boolean).
- `kinds` (array<string>).
- `min_confidence` (integer, min 0, max 100).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
