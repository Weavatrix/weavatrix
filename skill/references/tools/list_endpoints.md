# `list_endpoints`

Inventory statically extracted HTTP endpoints.

## When to use

Inventory statically extracted HTTP endpoints with optional method and path filters.

## Inputs

- `include_classified` (boolean).
- `max_results` (integer, min 0).
- `method` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
