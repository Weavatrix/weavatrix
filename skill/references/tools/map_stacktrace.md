# `map_stacktrace`

Map stack-trace text onto repository files and symbols.

## When to use

Map pasted Node, JVM, Python, or Rust stack frames to repository files and nearest symbols.

## Inputs

- `text` (string, required).
- `max_frames` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "map_stacktrace",
  "arguments": {
    "text": "<stack trace>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
