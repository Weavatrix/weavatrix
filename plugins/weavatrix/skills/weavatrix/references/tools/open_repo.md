# `open_repo`

Retarget only when this process was started with `--allow-retarget`.

## When to use

The launch root is fixed for the process lifetime unless `--allow-retarget` was passed. A pinned process refuses `open_repo` to another directory. Relaunch on that repository instead. A mismatched `expected_repository` is the same situation: relaunch, do not call `open_repo` on a pinned process.

## Inputs

- `path` (string, required).
- `build` (boolean).
- `mode` ("full" | "no-tests" | "tests-only").
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.
- `precision` (string).

## Minimal call

```json
{
  "name": "open_repo",
  "arguments": {
    "path": "<path>",
    "output_format": "text"
  }
}
```

Prefer `output_format:"structured"` when the client reads structuredContent. `text` is still the full JSON payload. The live MCP `tools/list` schema remains authoritative for this installed version.
