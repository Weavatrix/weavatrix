# `agent_trace`

Show the declared origin, profile, transport, and package bindings for one
plugin, skill, MCP server, catalog tool, or observation.

## When to use

After `agent_inventory`, when a visible name is not enough: the same `search`
label can belong to two packages. Use an exact id if the label is ambiguous.

## Inputs

- `label` (string, required) — exact node id or an unambiguous label.
- `max_related` (number, optional) — relation page size, 1–200, default 48.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "agent_trace",
  "arguments": {
    "label": "search-a",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
