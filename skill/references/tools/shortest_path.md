# `shortest_path`

Shortest typed dependency path between two nodes.

## When to use

Prove the shortest typed dependency path between two exact nodes.

## Inputs

- `source` (string, required).
- `target` (string, required).
- `max_hops` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "shortest_path",
  "arguments": {
    "source": "<source node>",
    "target": "<target node>",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
