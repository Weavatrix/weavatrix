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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
