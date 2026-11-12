# `get_dependents`

Bounded transitive reverse blast radius.

## When to use

Measure a bounded transitive reverse blast radius from one exact node. The seed and each dependent are id, label, kind, language, and span. Attributes stay on `get_node`.

## Inputs

- `label` (string, required).
- `depth` (integer, min 0).
- `include_container_importers` (boolean).
- `max_nodes` (integer, min 0).
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
