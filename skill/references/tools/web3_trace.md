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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
