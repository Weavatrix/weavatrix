# `vector_search`

Exact or bounded approximate nearest-neighbor search.

## When to use

Run exact or bounded approximate nearest-neighbor search over vectors supplied by the caller.

## Inputs

- `query` (array<number>, required).
- `vectors` (array<object>, required).
- `exact` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `top_k` (string).

## Minimal call

```json
{
  "name": "vector_search",
  "arguments": {
    "query": ["<value>"],
    "vectors": [{}],
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
