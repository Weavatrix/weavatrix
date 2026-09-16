# `dify_inventory`

List Dify apps, nodes, modes, and analysis bounds from exported YAML.

## When to use

Orient on one or more exported Dify apps already in the repository. This does
not call a live Dify console API.

## Inputs

- `path` (string, optional) — repository-relative YAML file or path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "dify_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
