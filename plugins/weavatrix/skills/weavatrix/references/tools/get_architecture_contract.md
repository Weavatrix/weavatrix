# `get_architecture_contract`

Read or preview the local target-architecture contract.

## When to use

Read or preview the local target-architecture contract.

## Inputs

- `action` ("preview").
- `baseline_mode` (string).
- `candidate_contract` (object).
- `confirm_token` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "get_architecture_contract",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
