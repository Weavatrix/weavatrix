# `module_map`

Production folder and dependency map.

## When to use

Orient in an unfamiliar repository through production folders and their dependency relationships.

## Inputs

- `include_non_product` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "module_map",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
