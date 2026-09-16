# `diagram_context`

Bounded Mermaid context: source fragments, explicit bindings, and gaps.

## When to use

Inspect one diagram or element after inventory. Exact implementation
bindings come from `.weavatrix/diagram-links.json`, never from a shared
display name.

## Inputs

- `label` (string, required) — graph id or unique native element label.
- `task` (string, optional) — what the caller intends to change or inspect.
- `max_related` (number, optional) — related row cap, 1–200, default 24.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "diagram_context",
  "arguments": {
    "label": "ORDERS",
    "task": "change createOrder",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
