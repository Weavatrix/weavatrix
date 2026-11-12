# `list_endpoints`

Inventory statically extracted HTTP endpoints.

## When to use

Inventory statically extracted HTTP endpoints with optional method and path filters. Each row is a compact node: id, label, kind, language, and span. `max_results` pages that list and the answer reports `endpoints_total`; omit it to return every visible endpoint. An App Router `route.*` file under `app` contributes one endpoint per exported HTTP method. The URL is the directory path; route groups are omitted. A Go struct that embeds `Unimplemented*Server` contributes `GRPC Service/Method`. A file whose first statement is `"use server"` contributes `ACTION /path/name` for each exported function. Page, layout, and route modules stay on their own rules.

## Inputs

- `include_classified` (boolean).
- `max_results` (integer, min 0).
- `method` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `path` (string).

## Minimal call

```json
{
  "name": "list_endpoints",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
