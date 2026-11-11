# `run_audit`

Repository structure and evidence completeness audit.

## When to use

Run a broad repository health and evidence-completeness pass before targeted investigation. A named category collects only that section. At least 200 parsed edges with resolved edges under one fifth of that is REVIEW.

## Inputs

- `base_ref` (string).
- `category` ("all" | "diagnostics" | "structure" | "dependencies" | "runtime").
- `changed_files` (array<string>).
- `debt` ("new" | "existing" | "all").
- `include_capabilities` (boolean).
- `include_classified` (boolean).
- `max_findings` (integer, min 0).
- `min_severity` ("low" | "medium" | "high" | "critical").
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "run_audit",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
