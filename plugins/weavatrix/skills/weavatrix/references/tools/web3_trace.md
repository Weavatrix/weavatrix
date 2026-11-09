# `web3_trace`

Walk proven ABI, artifact, and consumer bindings for one Web3 member or
call site.

## When to use

After `web3_inventory`, when a function or event name is not enough: follow
the exact occurrence to its ABI member and static client binding. `depth`
is walked from the seed; a cut reports truncation instead of pretending
the walk finished.

## Inputs

- `label` (string, required) — graph id or unique Web3 member / consumer label.
- `depth` (number, optional) — walk depth, 1–32, default 8.
- `max_nodes` (number, optional) — page size, 1–200, default 64.
- `cursor` (string, optional) — opaque page token from a previous page.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "web3_trace",
  "arguments": {
    "label": "Deposit(address,uint256)",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
