# `explain_architecture_violation`

Explain one active contract violation.

## When to use

Retrieve bounded evidence for one active architecture-violation fingerprint.

## Inputs

- `fingerprint` (string, required).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "explain_architecture_violation",
  "arguments": {
    "fingerprint": "<violation fingerprint>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
