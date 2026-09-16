# `n8n_inventory`

List n8n workflows, nodes, entry points, and analysis bounds from exported JSON.

## When to use

Orient on one or more exported n8n workflows already in the repository. This
does not call a live n8n API.

## Inputs

- `path` (string, optional) — repository-relative workflow file or path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "n8n_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
