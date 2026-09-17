# `web3_context`

Bounded Web3 context: changed ABI fragment, proven call or decoder sites,
and explicit deployment gaps.

## When to use

Inspect one ABI member or consumer after inventory. The `task` argument
changes selection: event work needs filters and decoders; output work
needs result consumers. A live chain is never queried.

## Inputs

- `label` (string, required) — graph id or unique Web3 member / consumer label.
- `task` (string, optional) — what the caller intends to change or inspect.
- `max_related` (number, optional) — related row cap, 1–200, default 24.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "web3_context",
  "arguments": {
    "label": "Deposit(address,uint256)",
    "task": "change-event",
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
