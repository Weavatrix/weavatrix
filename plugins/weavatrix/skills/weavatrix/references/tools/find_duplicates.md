# `find_duplicates`

Deterministic Type-1/2/3 clone families.

## When to use

Review bounded Type-1, Type-2, or Type-3 clone families before confirming candidates in source.

## Inputs

- `include_boilerplate` (boolean).
- `include_classified` (boolean).
- `include_declarative` (boolean, default true) — High-recall by default; false suppresses data-only catalogs but retains model, schema, and contract clones.
- `include_strings` (boolean, default false) — Also compare multi-line string payloads - inline SQL, templates, embedded scripts - which the code pass sees as a single token.
- `include_tests` (boolean).
- `min_similarity` (number, min 0, max 100) — 0..1 is a fraction; values above 1 through 100 are percentages.
- `min_tokens` (integer, min 0).
- `mode` ("strict" | "exact" | "renamed" | "near_miss").
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "find_duplicates",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
