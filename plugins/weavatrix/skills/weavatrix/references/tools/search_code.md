# `search_code`

Literal or Rust-regex repository search without ripgrep.

## When to use

Find bounded literal or regular-expression matches in file text when the source text is known but its location is not. The process keeps a resident content index: the first search builds it and later searches read it (`backend` `liveindex`). A `glob` still walks the filesystem. This is not a symbol-graph search. Use `find_references` or `go_to_definition` for a symbol.

## Inputs

- `query` (string, required).
- `after` (integer, min 0).
- `before` (integer, min 0).
- `glob` (string).
- `is_regex` (boolean).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
