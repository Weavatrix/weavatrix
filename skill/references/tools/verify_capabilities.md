# `verify_capabilities`

Resolve declared capabilities against exposed endpoint evidence.

## When to use

Resolve declared capabilities against statically exposed endpoint evidence.

## Inputs

- `include_classified` (boolean).
- `include_tests` (boolean).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "verify_capabilities",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
