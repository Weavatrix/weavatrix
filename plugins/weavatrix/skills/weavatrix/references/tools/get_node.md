# `get_node`

Resolve one exact graph node.

## When to use

Resolve one exact graph label after another tool has supplied an unambiguous file, symbol, endpoint, or node id.

## Inputs

- `label` (string, required).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "get_node",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
