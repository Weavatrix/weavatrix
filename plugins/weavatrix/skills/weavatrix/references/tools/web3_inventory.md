# `web3_inventory`

List supplied contract ABIs, compiler artifacts, and static viem/wagmi
consumers without touching a chain.

## When to use

Orient on ABI JSON, solc/Foundry artifacts, and client call sites already
in the repository. ABI equality is not a deployment proof.

## Inputs

- `path` (string, optional) — repository-relative ABI, artifact, or consumer path fragment.
- `max_results` (number, optional) — inventory page size, 1–500, default 200.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "web3_inventory",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
