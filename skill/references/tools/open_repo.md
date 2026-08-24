# `open_repo`

Retarget to another local repository.

## When to use

Retarget the process-local server to another local repository.

## Inputs

- `path` (string, required).
- `build` (boolean).
- `mode` ("full" | "no-tests" | "tests-only").
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `precision` (string).

## Minimal call

```json
{
  "name": "open_repo",
  "arguments": {
    "path": "<path>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
