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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
