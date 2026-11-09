# `rebuild_graph`

Rebuild the derived in-memory graph without source writes.

## When to use

Force an explicit graph rebuild only when automatic refresh is stale or a deliberate mode change is required.

Do not rebuild on every call; the server normally refreshes derived state automatically.

## Inputs

- `mode` ("full" | "no-tests" | "tests-only").
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `precision` (string).
- `scope` (string).

## Minimal call

```json
{
  "name": "rebuild_graph",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
