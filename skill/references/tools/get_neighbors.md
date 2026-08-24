# `get_neighbors`

Direct typed incoming and outgoing relationships.

## When to use

Inspect only the direct typed incoming and outgoing relationships of one exact node.

For transitive reverse impact use `get_dependents`; for bounded multi-hop exploration use `query_graph`.

## Inputs

- `label` (string, required).
- `cursor` (string).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `relation_filter` (string | array<string>).
- `response_detail` ("compact" | "full").

## Minimal call

```json
{
  "name": "get_neighbors",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
