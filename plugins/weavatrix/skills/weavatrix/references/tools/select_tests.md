# `select_tests`

Select the test suites a change most plausibly needs to run.

## When to use

Rank the test suites most plausibly affected by a change; it selects tests but does not run them.

## Inputs

- `base` (string).
- `base_ref` (string).
- `depth` (integer, min 0).
- `diff` (string).
- `files` (array<string>).
- `head_ref` (string).
- `max_nodes` (integer, min 0).
- `max_tests` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `precision` ("graph").

## Minimal call

```json
{
  "name": "select_tests",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
