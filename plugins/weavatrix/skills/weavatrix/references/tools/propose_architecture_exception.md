# `propose_architecture_exception`

Return a reviewable exception proposal without writing it.

## When to use

Prepare a reviewable exception proposal without writing it to the repository.

## Inputs

- `fingerprint` (string, required).
- `reason` (string, required).
- `expires` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
