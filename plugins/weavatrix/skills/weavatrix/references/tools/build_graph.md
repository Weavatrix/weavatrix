# `build_graph`

Typed workspace, package, target, task, and runner topology from captured
manifest evidence.

## When to use

Inspect Cargo, npm/TypeScript, Go, and Python workspace members, targets,
aggregators, entry points, configuration variants, and runner topology. The
same model feeds architecture and local CI linkage; source evidence is captured
with the analyzed snapshot rather than reread from a changing worktree.

## Inputs

- `max_members` (integer, min 0).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "build_graph",
  "arguments": {
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.

`max_members` limits presentation only. Returned totals still describe the
complete recovered model, and the result reports an incomplete page instead of
pretending omitted members do not exist.
