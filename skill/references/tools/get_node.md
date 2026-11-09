# `get_node`

Resolve one exact graph node.

## When to use

Resolve one exact graph label after another tool has supplied an unambiguous file, symbol, endpoint, or node id.

## Inputs

- `label` (string, required).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "get_node",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
