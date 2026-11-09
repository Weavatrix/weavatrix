# `dify_trace`

Upstream and downstream Dify port flow, selectors, and typed data relations.

## When to use

Walk declared control flow and typed data edges from one exported Dify node
or app. A DAG merge is a merge, not a cycle. Missing consumers stay missing.

## Inputs

- `label` (string, required) — node or app id, title, or graph label.
- `depth` (number, optional) — hop limit, 1–32, default 8.
- `max_nodes` (number, optional) — page size, 1–500, default 100.
- `cursor` (string, optional) — `v1:<offset>` or `v1:<offset>:<revision>`.
- `direction` ("outgoing" | "incoming", optional) — walk direction.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "dify_trace",
  "arguments": {
    "label": "LLM",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
