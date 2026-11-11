# `semantic_link`

Rank symbols for a phrase, or link caller-supplied vectors.

## When to use

Pass `query` to rank functions, methods, and types by the local deterministic token hash `weavatrix-token-hash-v1` (name, path, a short doc comment above the declaration, the declaration line, and a short body). Test paths rank lower. That hash is not a neural embedding, and Weavatrix does not create one.

Pass a non-empty `vectors` array only when you already have embeddings. An empty `vectors` array without `query` is an error and builds no links. When both are set, the supplied vectors are linked and the phrase is not ranked.

## Inputs

- `query` (string) — phrase for `weavatrix-token-hash-v1`. Not a neural embedding.
- `vectors` (array<object>) — caller-supplied embedding rows. Required only when `query` is omitted; an empty array is an error in that case.
- `min_similarity` (number, min 0, max 100) — 0..1 is a fraction; values above 1 through 100 are percentages.
- `model` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `selection` ("union" | "mutual" | "directed").
- `top_k` (string).

## Minimal call

```json
{
  "name": "semantic_link",
  "arguments": {
    "query": "strict manufacturer identity",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
