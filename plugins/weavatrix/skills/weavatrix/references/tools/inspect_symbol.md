# `inspect_symbol`

Definition, direct relationships and source evidence.

## When to use

Collect one symbol declaration, owner, callers, callees, and source evidence.

## Inputs

- `label` (string, required).
- `context_lines` (integer, min 0).
- `max_containers` (integer, min 0).
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `precision` (string).
- `timeout_ms` (integer, min 0).

## Minimal call

```json
{
  "name": "inspect_symbol",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
