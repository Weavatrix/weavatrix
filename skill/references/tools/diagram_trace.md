# `diagram_trace`

Walk `declared_architecture` arrows inside one Mermaid diagram.

## When to use

Follow drawn paths from a native element id. This does not treat the arrow
as a production `calls` edge.

## Inputs

- `label` (string, required) — graph id or unique native element label.
- `depth` (number, optional) — walk depth, 1–32, default 8.
- `max_nodes` (number, optional) — page size, 1–500, default 100.
- `cursor` (string, optional) — opaque page token from a previous page.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "diagram_trace",
  "arguments": {
    "label": "ORDERS",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
