# `get_community`

Return one weak graph component.

## When to use

Inspect one deterministic weak graph component by its id.

## Inputs

- `community_id` (integer, required, min 0).
- `cursor` (string).
- `max_nodes` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
