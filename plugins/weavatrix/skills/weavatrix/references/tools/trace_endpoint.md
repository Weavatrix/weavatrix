# `trace_endpoint`

Resolve an endpoint and its bounded call neighborhood.

## When to use

Resolve one HTTP route and inspect its bounded handler and call neighborhood.

## Inputs

- `path` (string, required).
- `context_lines` (integer, min 0).
- `handler_file` (string).
- `include_classified` (boolean).
- `max_depth` (integer, min 0).
- `max_excerpts` (integer, min 0).
- `max_nodes` (integer, min 0).
- `method` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "trace_endpoint",
  "arguments": {
    "path": "<path>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
