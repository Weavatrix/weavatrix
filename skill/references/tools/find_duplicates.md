# `find_duplicates`

Deterministic Type-1/2/3 clone families.

## When to use

Review bounded Type-1, Type-2, or Type-3 clone families before confirming candidates in source. Files named `.gen.` or `.generated.` stay out unless `include_boilerplate` is set.

## Inputs

- `include_boilerplate` (boolean).
- `include_classified` (boolean).
- `include_declarative` (boolean, default true) — High-recall by default; false suppresses data-only catalogs but retains model, schema, and contract clones.
- `include_strings` (boolean, default false) — Also compare multi-line string payloads - inline SQL, templates, embedded scripts - which the code pass sees as a single token.
- `include_tests` (boolean).
- `min_similarity` (number, min 0, max 100) — 0..1 is a fraction; values above 1 through 100 are percentages.
- `min_tokens` (integer, min 0).
- `mode` ("strict" | "exact" | "renamed" | "near_miss").
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
