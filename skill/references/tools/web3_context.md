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
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

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

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
