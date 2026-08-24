# `module_map`

Production folder and dependency map.

## When to use

Orient in an unfamiliar repository through production folders and their dependency relationships.

## Inputs

- `include_non_product` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
