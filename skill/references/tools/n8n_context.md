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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
