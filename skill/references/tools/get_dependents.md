# `get_dependents`

Bounded transitive reverse blast radius.

## When to use

Measure a bounded transitive reverse blast radius from one exact node.

## Inputs

- `label` (string, required).
- `depth` (integer, min 0).
- `include_container_importers` (boolean).
- `max_nodes` (integer, min 0).
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `precision` ("graph").
- `timeout_ms` (integer, min 0).

## Minimal call

```json
{
  "name": "get_dependents",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
