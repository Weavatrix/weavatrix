# `find_references`

Occurrences of the symbol at a position or label, from the graph and an on-disk SCIP index if present.

## When to use

List every recorded occurrence of one symbol after you have a label or a pinned
`(path, line, column)` usage.

## Inputs

- `label` (string) — exact node label; mutually exclusive with a full position.
- `path` (string) — repository-relative file when resolving by position.
- `line` (integer, min 1) — 1-based line when resolving by position.
- `column` (integer, min 1) — 1-based column when resolving by position.
- `scip_path` (string) — optional on-disk SCIP index; never spawned.
- `max_results` (integer, min 1).
- `cursor` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "find_references",
  "arguments": {
    "path": "src/main.rs",
    "line": 42,
    "column": 12,
    "output_format": "text"
  }
}
```

Requires `label` or a complete position. The live MCP `tools/list` schema
remains authoritative for this installed version.
