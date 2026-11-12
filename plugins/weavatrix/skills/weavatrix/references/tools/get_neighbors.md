# `get_neighbors`

Direct typed incoming and outgoing relationships.

## When to use

Inspect only the direct typed incoming and outgoing relationships of one exact node. The seed and each neighbor node are id, label, kind, language, and span unless `response_detail` is `full`. A compact row also carries direction, relation, and, when present, coupling and the call line. Test and classified neighbors stay out unless `include_tests` or `include_classified` is set.

For transitive reverse impact use `get_dependents`; for bounded multi-hop exploration use `query_graph`.

## Inputs

- `label` (string, required).
- `cursor` (string).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
