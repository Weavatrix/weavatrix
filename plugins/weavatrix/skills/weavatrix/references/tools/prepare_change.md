# `prepare_change`

Select architecture rules for intended changed files.

## When to use

Select the architecture rules relevant to intended changed files before editing.

## Inputs

- `files` (array<string>, required).
- `intent` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
