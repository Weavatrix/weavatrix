# `list_endpoints`

Inventory statically extracted HTTP endpoints.

## When to use

Inventory statically extracted HTTP endpoints with optional method and path filters.

## Inputs

- `include_classified` (boolean).
- `max_results` (integer, min 0).
- `method` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `path` (string).

## Minimal call

```json
{
  "name": "list_endpoints",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
