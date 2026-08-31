# `git_read_blob`

Bounded UTF-8 file content at an immutable Git revision or blob OID; binary blobs are refused.

## When to use

After `graph_diff` or `git_history`, read a file "as it was" at a revision - or the exact blob an OID names - without checking anything out.

## Inputs

- `max_bytes` (integer, min 1) — cap on returned content bytes (default 262144); the true size and a truncation flag are always reported.
- `oid` (string) — blob object id; mutually exclusive with `path`.
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `path` (string) — repository-relative file path looked up in the revision's tree.
- `revision` (string) — any resolvable revision, `~N` first-parent steps supported; default `HEAD`.
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "git_read_blob",
  "arguments": {
    "path": "src/app.js",
    "revision": "HEAD~1",
    "output_format": "text"
  }
}
```

Binary content fails closed with the blob's true size; the answer never
fabricates text from bytes. The live MCP `tools/list` schema remains
authoritative for this installed version.
