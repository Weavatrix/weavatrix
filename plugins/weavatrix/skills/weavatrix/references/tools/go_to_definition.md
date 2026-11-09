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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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
