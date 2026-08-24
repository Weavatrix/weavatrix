# `coverage_map`

Measured coverage discovery or explicit static reachability.

## When to use

Attach measured coverage reports to graph nodes and keep static reachability separately labeled.

A missing measured report must not be described as clean coverage.

## Inputs

- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `path` (string).
- `top_n` (integer, min 0).

## Minimal call

```json
{
  "name": "coverage_map",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
