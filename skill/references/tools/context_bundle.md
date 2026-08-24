# `context_bundle`

Compact graph and source bundle for one symbol.

## When to use

Assemble a ranked, token-bounded workset around one task or target.

## Inputs

- `label` (string, required).
- `context_lines` (integer, min 0).
- `include_classified` (boolean).
- `max_reexports` (integer, min 0).
- `max_references` (integer, min 0).
- `max_related` (integer, min 0).
- `max_source_files` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
