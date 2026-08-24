# `search_code`

Literal or Rust-regex repository search without ripgrep.

## When to use

Find bounded literal or regular-expression matches when the source text is known but its location is not.

## Inputs

- `query` (string, required).
- `after` (integer, min 0).
- `before` (integer, min 0).
- `glob` (string).
- `is_regex` (boolean).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "search_code",
  "arguments": {
    "query": "<value>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
