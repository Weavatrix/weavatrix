# `n8n_inventory`

List n8n workflows, nodes, entry points, and analysis bounds from exported JSON.

## When to use

Orient on one or more exported n8n workflows already in the repository. This
does not call a live n8n API.

## Inputs

- `path` (string, optional) — repository-relative workflow file or path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "n8n_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
