# `get_community`

Return one weak graph component.

## When to use

Inspect one deterministic weak graph component by its id.

## Inputs

- `community_id` (integer, required, min 0).
- `cursor` (string).
- `max_nodes` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "get_community",
  "arguments": {
    "community_id": 1,
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
