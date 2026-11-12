# `context_bundle`

Compact graph and source bundle for one symbol.

## When to use

Assemble a ranked, token-bounded workset around one task or target. The subject is id, label, kind, language, and span. Relationship rows match compact `get_neighbors`.

## Inputs

- `label` (string, required).
- `context_lines` (integer, min 0).
- `include_classified` (boolean).
- `max_reexports` (integer, min 0).
- `max_references` (integer, min 0).
- `max_related` (integer, min 0).
- `max_source_files` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `precision` (string).
- `timeout_ms` (integer, min 0).
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "context_bundle",
  "arguments": {
    "label": "<exact node label>",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
