# `agent_context`

Bounded context for one agent package node: declared bindings, source
fragments, and explicit authorization gaps.

## When to use

Inspect one plugin, skill, or server after `agent_inventory` or `agent_trace`.
`allowed-tools` stays a declaration. Commands are not executed.

## Inputs

- `label` (string, required) — exact node id or an unambiguous label.
- `task` (string, optional) — what the caller intends to change or inspect.
- `max_related` (number, optional) — relation page size, 1–200, default 24.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "agent_context",
  "arguments": {
    "label": "lookup",
    "task": "inspect",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
