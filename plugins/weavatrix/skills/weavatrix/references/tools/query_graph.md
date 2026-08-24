# `query_graph`

Bounded BFS or DFS around exact or textual seeds.

## When to use

Traverse a bounded BFS or DFS when a question needs several hops, direction controls, or multiple seeds.

Start with exact seeds and a small depth, node cap, and `token_budget`.

## Inputs

- `augment_seeds` (boolean).
- `context_filter` (array<string>).
- `depth` (integer, min 0).
- `flow_direction` ("forward" | "backward" | "both").
- `include_classified` (boolean).
- `include_low_signal` (boolean).
- `max_nodes` (integer, min 0).
- `mode` ("bfs" | "dfs").
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `question` (string).
- `relation_filter` (string | array<string>).
- `seed_files` (array<string>).
- `seed_symbols` (array<string>).
- `token_budget` (integer, min 1) — Approximate output ceiling in tokens (serialized bytes / 4); result arrays are trimmed from the tail to fit and the report states what was dropped.

## Minimal call

```json
{
  "name": "query_graph",
  "arguments": {
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
