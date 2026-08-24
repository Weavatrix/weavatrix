# `graph_diff`

Compare the current snapshot with an immutable Git revision.

## When to use

Compare the current graph snapshot with an immutable Git revision.

## Inputs

- `base_ref` (string, required).
- `detail` ("file_pairs" | "edges", default "file_pairs") — Aggregate edge churn by source file, target file, and relation by default; request edges for individual edge provenance.
- `head_ref` (string).
- `max_results` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `path` (string).
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "graph_diff",
  "arguments": {
    "base_ref": "HEAD~1",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
