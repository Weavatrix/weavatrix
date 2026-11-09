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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
