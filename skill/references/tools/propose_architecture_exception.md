# `propose_architecture_exception`

Return a reviewable exception proposal without writing it.

## When to use

Prepare a reviewable exception proposal without writing it to the repository.

## Inputs

- `fingerprint` (string, required).
- `reason` (string, required).
- `expires` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "propose_architecture_exception",
  "arguments": {
    "fingerprint": "<violation fingerprint>",
    "reason": "<reason>",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
