# `change_impact`

Read-only Git change impact with graph evidence.

## When to use

Map a working-tree diff, explicit files, or Git revisions onto affected graph nodes.

Static impact is not proof that selected behavior executed.

## Inputs

- `base` (string).
- `base_ref` (string).
- `depth` (integer, min 0).
- `diff` (string).
- `files` (array<string>).
- `head_ref` (string).
- `max_nodes` (integer, min 0).
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `precision` ("graph").
- `timeout_ms` (integer, min 0).

## Minimal call

```json
{
  "name": "change_impact",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
