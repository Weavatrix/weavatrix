# `dify_context`

Bounded Dify context for one node: proven consumers, selector sites, and explicit gaps.

## When to use

Inspect one exported Dify node or variable after `dify_inventory` or
`dify_trace`. Answers include source fragments and consumer lists for impact
tasks. Secrets stay omitted.

## Inputs

- `label` (string, required) — node, app, or variable id or graph label.
- `task` (string, optional) — `explain` or `impact`. Impact adds consumer lists.
- `max_related` (number, optional) — related-item page size.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "dify_context",
  "arguments": {
    "label": "LLM",
    "task": "impact",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
