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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
