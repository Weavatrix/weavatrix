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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
