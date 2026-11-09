# `git_history`

Bounded direct Git history without launching git.

## When to use

Inspect bounded commit history inside the active repository. Without `path` this is repository HEAD history. With `path` it is the commits that touch that file or directory. The default six-month window applies only when `path` is omitted or `months` is set.

## Inputs

- `first_parent` (boolean).
- `include_analytics` (boolean).
- `max_commits` (integer, min 0).
- `max_pairs` (integer, min 0).
- `min_pair_count` (integer, min 0).
- `months` (integer, min 0).
- `path` (string) — repository-relative file or directory. Omit it for repository HEAD history.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `revision` (string).
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "git_history",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
