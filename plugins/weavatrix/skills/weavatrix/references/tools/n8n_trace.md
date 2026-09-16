# `n8n_trace`

Upstream and downstream n8n port flow, output dependencies, and static
subworkflow links.

## When to use

Walk `flows_to`, `depends_on_output`, `handles_error_with`, and
`calls_workflow` from one node. Do not treat those relations as the same
walk. Missing subworkflows are not provided, not deleted.

## Inputs

- `label` (string, required) — exact node or workflow identity.
- `depth` (number, optional) — hop bound, 1–32, default 8.
- `max_nodes` (number, optional) — page size, 1–500, default 100.
- `cursor` (string, optional) — opaque `v1:<offset>` token from `page.next_cursor`.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "n8n_trace",
  "arguments": {
    "label": "Send Invoice",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
