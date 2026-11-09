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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
