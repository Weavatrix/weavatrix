# `god_nodes`

Rank high-connectivity production nodes.

## When to use

Find unusually connected production nodes for architecture or change-risk review.

## Inputs

- `include_classified` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "god_nodes",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
