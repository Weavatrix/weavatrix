# `change_impact`

Read-only Git change impact with graph evidence.

## When to use

Map a working-tree diff, explicit files, or Git revisions onto affected graph nodes. Naming `files` or `target` when that file matches HEAD still returns its symbols as `change: "file_scope"` and `change_basis: "explicit_file"`. That is a hypothetical blast radius, not a measured edit. A dirty file keeps the real symbol diff. `status` stays COMPLETE when the tool ran. Read `evidence_completeness` and `stop_reason`. `MAX_NODES` means the combined cap omitted nodes. Impacted nodes are id, label, kind, language, and span.

Static impact is not proof that selected behavior executed.

## Inputs

- `base` (string).
- `base_ref` (string).
- `depth` (integer, min 0).
- `diff` (string).
- `files` (array<string>).
- `head_ref` (string).
- `max_nodes` (integer, min 0, default 40). Combined cap on impacted nodes across every seed. Production callers are kept ahead of tests. A trimmed answer reports `MAX_NODES`.
- `max_references` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `precision` ("graph").
- `timeout_ms` (integer, min 0).

## Minimal call

```json
{
  "name": "change_impact",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
