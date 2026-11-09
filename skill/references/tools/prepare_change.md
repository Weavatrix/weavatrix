# `prepare_change`

Select architecture rules for intended changed files.

## When to use

Select the architecture rules relevant to intended changed files before editing.

## Inputs

- `files` (array<string>, required).
- `intent` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "prepare_change",
  "arguments": {
    "files": ["<value>"],
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
