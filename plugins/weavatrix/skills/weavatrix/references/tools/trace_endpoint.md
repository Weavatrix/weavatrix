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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
