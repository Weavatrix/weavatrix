# `diagram_inventory`

List Mermaid flowchart diagrams, native elements, and explicit sidecar
bindings.

## When to use

Orient on `.mmd`, `.mermaid`, or fenced Mermaid already in the repository.
Drawn arrows are declared architecture, not production calls.

## Inputs

- `path` (string, optional) — repository-relative diagram file or path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "diagram_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
