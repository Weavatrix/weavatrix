# `vector_search`

Exact or bounded approximate nearest-neighbor search.

## When to use

Run exact or bounded approximate nearest-neighbor search over vectors supplied by the caller.

## Inputs

- `query` (array<number>, required).
- `vectors` (array<object>, required).
- `exact` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
