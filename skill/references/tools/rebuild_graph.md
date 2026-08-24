# `rebuild_graph`

Rebuild the derived in-memory graph without source writes.

## When to use

Force an explicit graph rebuild only when automatic refresh is stale or a deliberate mode change is required.

Do not rebuild on every call; the server normally refreshes derived state automatically.

## Inputs

- `mode` ("full" | "no-tests" | "tests-only").
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
