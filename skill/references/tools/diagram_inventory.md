# `diagram_inventory`

List Mermaid flowchart diagrams, native elements, and explicit sidecar
bindings.

## When to use

Orient on `.mmd`, `.mermaid`, or fenced Mermaid already in the repository.
Drawn arrows are declared architecture, not production calls.

## Inputs

- `path` (string, optional) — repository-relative diagram file or path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "diagram_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
