# `inspect_symbol`

Definition, direct relationships and source evidence.

## When to use

Collect one symbol declaration, owner, callers, callees, and source evidence.

## Inputs

- `label` (string, required).
- `context_lines` (integer, min 0).
- `max_containers` (integer, min 0).
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
