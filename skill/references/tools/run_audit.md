# `run_audit`

Repository structure and evidence completeness audit.

## When to use

Run a broad repository health and evidence-completeness pass before targeted investigation.

## Inputs

- `base_ref` (string).
- `category` ("all" | "diagnostics" | "structure" | "dependencies" | "runtime").
- `changed_files` (array<string>).
- `debt` ("new" | "existing" | "all").
- `include_capabilities` (boolean).
- `include_classified` (boolean).
- `max_findings` (integer, min 0).
- `min_severity` ("low" | "medium" | "high" | "critical").
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "run_audit",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
