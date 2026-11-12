# `git_fetch`

Shallow-clone one Git URL at one ref into a local cache and return that checkout. Depth is 1. This launches git and writes only the cache. The process root stays pinned. `git_history` still reads the active repository.

## When to use

The repository to analyze is a remote URL, and this process is pinned to another root. Call `git_fetch`, then launch a new process on `checkout`, or call `open_repo` with that path only when this process was started with `--allow-retarget`. A repeated call for the same URL updates the same cache entry. The cache is not a working copy to edit.

## Inputs

- `url` (string, required) — https, http, ssh, git, or file URL, scp-style `git@host:path`, or an absolute local path. A URL that embeds credentials is refused. A trailing `.git` names the same cache entry.
- `ref` (string) — branch, tag, or commit. Omit it to fetch the remote HEAD. Depth is always 1.
- `output_format` ("text" | "json" | "structured", default "json") — text returns one JSON text block of the full payload, not a shorter summary; json returns structured output and mirrors that JSON into text, so the answer is about twice as large; structured drops the mirror and is the smaller payload when the client reads structuredContent.

## Minimal call

```json
{
  "name": "git_fetch",
  "arguments": {
    "url": "https://github.com/org/repo",
    "ref": "main"
  }
}
```

The answer carries `checkout`, `commit`, `ref`, `depth` 1, and `reused`. `repository_context.root` remains the launch root. The live MCP `tools/list` schema remains authoritative for this installed version.
