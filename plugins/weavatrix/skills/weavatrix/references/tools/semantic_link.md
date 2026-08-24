# `semantic_link`

Build inferred semantic graph evidence from supplied vectors.

## When to use

Build inferred semantic graph edges from vectors supplied by the caller; Weavatrix does not create embeddings.

## Inputs

- `vectors` (array<object>, required).
- `min_similarity` (number, min 0, max 100) — 0..1 is a fraction; values above 1 through 100 are percentages.
- `model` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `selection` ("union" | "mutual" | "directed").
- `top_k` (string).

## Minimal call

```json
{
  "name": "semantic_link",
  "arguments": {
    "vectors": [{}],
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
