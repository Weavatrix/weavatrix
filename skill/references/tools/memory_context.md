# `memory_context`

Compile bounded temporal memory context from supplied events.

## When to use

Compile bounded temporal context from events and a request supplied by the caller.

## Inputs

- `events` (array<object>, required).
- `request` (object, required).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
