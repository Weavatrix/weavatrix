# `go_to_definition`

Resolve the symbol at a source position to its definition without guessing by name.

## When to use

You already have `(path, line, column)` for a usage and need the definition the
graph recorded for that occurrence - not a same-named overload elsewhere.

## Inputs

- `path` (string, required) — repository-relative file.
- `line` (integer, required, min 1) — 1-based line of the usage.
- `column` (integer, required, min 1) — 1-based column of the usage.
- `scip_path` (string) — optional on-disk SCIP index; never spawned.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "go_to_definition",
  "arguments": {
    "path": "src/main.rs",
    "line": 42,
    "column": 12,
    "output_format": "text"
  }
}
```

Unresolved positions stay `UNRESOLVED`; a unique repository name is not a
definition. The live MCP `tools/list` schema remains authoritative for this
installed version.
