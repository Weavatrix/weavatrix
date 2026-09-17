# `web3_inventory`

List supplied contract ABIs, compiler artifacts, and static viem/wagmi
consumers without touching a chain.

## When to use

Orient on ABI JSON, solc/Foundry artifacts, and client call sites already
in the repository. ABI equality is not a deployment proof.

## Inputs

- `path` (string, optional) — repository-relative ABI, artifact, or consumer path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "web3_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
