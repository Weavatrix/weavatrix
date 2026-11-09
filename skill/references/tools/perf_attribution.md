# `perf_attribution`

Correlate a measurement series with the declarations that changed between the revisions that produced it.

## When to use

You already have a harness table of measurements per Git revision and want
co-occurrence with structural change - not a profiler sample.

## Inputs

- `measurements_file` (string, required) — repository-relative TSV/CSV the harness wrote; `#` comment rows are ignored.
- `metric` (string, required) — column with the measured number.
- `revision_column` (string, default `"commit"`) — column with the Git revision.
- `direction` ("lower_is_better" | "higher_is_better", default `"lower_is_better"`).
- `max_revisions` (integer, min 2).
- `min_delta_percent` (integer, min 0).
- `top_n` (integer, min 0).
- `path` (string).
- `include_tests` (boolean).
- `include_classified` (boolean).
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "perf_attribution",
  "arguments": {
    "measurements_file": "bench/results.tsv",
    "metric": "ns_per_op",
    "output_format": "text"
  }
}
```

This is co-occurrence between caller measurements and static change, not CPU
profiler attribution. The live MCP `tools/list` schema remains authoritative
for this installed version.
