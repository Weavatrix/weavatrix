# `seo_link_suggestions`

Directional SEO internal-link evidence from supplied page profiles.

## When to use

Generate directional internal-link evidence from caller-supplied page profiles and vectors.

## Inputs

- `pages` (array<object>, required).
- `vectors` (array<object>, required).
- `allow_cross_language` (boolean).
- `min_similarity` (number, min 0, max 100) — 0..1 is a fraction; values above 1 through 100 are percentages.
- `model` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `selection` ("union" | "mutual" | "directed").
- `top_k` (string).

## Minimal call

```json
{
  "name": "seo_link_suggestions",
  "arguments": {
    "pages": [{}],
    "vectors": [{}],
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
