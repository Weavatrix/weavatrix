# `web3_impact`

Compare supplied ABI revisions and report consumer-specific interface
deltas, including silent event misdecode risk.

## When to use

A contract ABI changed and a client still binds an older copy. An indexed
mask change can decode without throwing. Deployment state stays
`not_provided` unless a runtime observation was supplied. Consumers stay
on the paired baseline/candidate files. A missing candidate is
`missing_input`, not `MEMBER_REMOVED`. Comment properties inside a call
object are not the callee.

## Inputs

- `path` (string, optional) — repository-relative path fragment used when baseline/candidate are omitted.
- `baseline` (string, optional) — repository-relative consumer or previous ABI path.
- `candidate` (string, optional) — repository-relative provider or new ABI path.
- `provider` (string, optional) — alias for candidate.
- `task` (string, optional) — selection hint such as `change-event`, `change-input`, or `change-output`.
- `max_results` (number, optional) — change page size, 1–200, default 50.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "web3_impact",
  "arguments": {
    "task": "change-event",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
