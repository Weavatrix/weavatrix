# `n8n_context`

Bounded n8n context for one node: proven dependencies, expression sites, and
explicit gaps.

## When to use

Inspect one exported node or workflow before changing it. Secrets, cookies,
auth headers, URL credentials, `pinData`, `staticData`, and `$env` values are
not placed on the default context.

## Inputs

- `label` (string, required) — exact node or workflow identity.
- `task` (string, optional) — what the caller intends to change or inspect.
- `max_related` (number, optional) — related-item bound, default 24.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "n8n_context",
  "arguments": {
    "label": "Send Invoice",
    "task": "change email recipient",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
