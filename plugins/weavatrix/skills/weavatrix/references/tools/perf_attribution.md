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
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.

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
