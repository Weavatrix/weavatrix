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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

## Minimal call

```json
{
  "name": "build_graph",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.

`max_members` limits presentation only. Returned totals still describe the
complete recovered model, and the result reports an incomplete page instead of
pretending omitted members do not exist.
