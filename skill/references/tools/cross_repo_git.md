# `cross_repo_git`

Parallel histories, shared commits, or diffs across local repositories.

## When to use

Compare histories, shared commits, or diffs across explicitly supplied local repository roots.

## Inputs

- `repositories` (array<object>, required).
- `action` ("histories" | "shared_commits" | "diff").
- `base_ref` (string).
- `first_parent` (boolean).
- `head_ref` (string).
- `left` (string).
- `max_commits` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `revision` (string).
- `right` (string).

## Minimal call

```json
{
  "name": "cross_repo_git",
  "arguments": {
    "repositories": [{}],
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
