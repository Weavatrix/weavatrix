# `memory_context`

Compile bounded temporal memory context from supplied events.

## When to use

Compile bounded temporal context from events and a request supplied by the caller.

## Inputs

- `events` (array<object>, required).
- `request` (object, required).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "memory_context",
  "arguments": {
    "events": [{}],
    "request": {},
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
