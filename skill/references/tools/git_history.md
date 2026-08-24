# `git_history`

Bounded direct Git history without launching git.

## When to use

Inspect bounded commit history, churn, and co-change inside the active repository.

## Inputs

- `first_parent` (boolean).
- `include_analytics` (boolean).
- `max_commits` (integer, min 0).
- `max_pairs` (integer, min 0).
- `min_pair_count` (integer, min 0).
- `months` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
