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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
