# `map_stacktrace`

Map stack-trace text onto repository files and symbols.

## When to use

Map pasted Node, JVM, Python, or Rust stack frames to repository files and nearest symbols.

## Inputs

- `text` (string, required).
- `max_frames` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
