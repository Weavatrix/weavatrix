# `get_architecture_contract`

Read or preview the local target-architecture contract.

## When to use

Read or preview the local target-architecture contract.

## Inputs

- `action` ("preview").
- `baseline_mode` (string).
- `candidate_contract` (object).
- `confirm_token` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "get_architecture_contract",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
