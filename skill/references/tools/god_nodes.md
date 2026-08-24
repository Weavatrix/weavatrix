# `god_nodes`

Rank high-connectivity production nodes.

## When to use

Find unusually connected production nodes for architecture or change-risk review.

## Inputs

- `include_classified` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
