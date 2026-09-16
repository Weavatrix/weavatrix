# `agent_trace`

Show the declared origin, profile, transport, and package bindings for one
plugin, skill, MCP server, catalog tool, or observation.

## When to use

After `agent_inventory`, when a visible name is not enough: the same `search`
label can belong to two packages. Use an exact id if the label is ambiguous.

## Inputs

- `label` (string, required) — exact node id or an unambiguous label.
- `max_related` (number, optional) — relation page size, 1–200, default 48.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
