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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
