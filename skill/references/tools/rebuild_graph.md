# `rebuild_graph`

Rebuild the derived in-memory graph without source writes.

## When to use

Force an explicit graph rebuild only when automatic refresh is stale or a deliberate mode change is required.

Do not rebuild on every call; the server normally refreshes derived state automatically.

## Inputs

- `mode`: `full` (default) parses every scanned file. `no-tests` drops test paths. `tests-only` keeps test paths. Any other value is an error.
- `precision`: `graph` or omitted. Any other value is an error and does not rebuild.
- `scope`: optional repository-relative file or directory. Files outside it are not parsed. An empty scope, an absolute path, or `..` is an error. Omit it for the whole tree.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

The answer is the node and edge counts before and after, plus `mode`, `precision`, `scope`, `files_scanned`, and `files_parsed`. A cut that leaves files out marks the snapshot incomplete. No source file is written. A child `repository` reads that child and does not move the process pin.

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
