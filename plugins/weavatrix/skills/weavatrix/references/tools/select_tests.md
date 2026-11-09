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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
