# Weavatrix — native MCP repository intelligence

<img src="https://raw.githubusercontent.com/Weavatrix/weavatrix/main/plugins/weavatrix/assets/logo.svg" alt="Weavatrix logo" width="88" align="right">

[![CI](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml/badge.svg)](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/weavatrix.svg)](https://www.npmjs.com/package/weavatrix)
[![engine](https://img.shields.io/crates/v/weavatrix-rust.svg?label=engine)](https://crates.io/crates/weavatrix-rust)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Weavatrix/weavatrix/blob/main/LICENSE)

**Give your coding agent repository evidence before it starts guessing.**

Weavatrix answers the questions agents otherwise invent: what breaks if this
file changes, who consumes this n8n field, whether an MCP schema still
accepts yesterday’s request, which viem call sites follow an ABI layout
change, and whether `.weavatrix/architecture.json` still holds. **64
read-only operations**, one revision-bound graph, no LSP and no prompt pack.

Codex, Claude Code, Cursor, and Grok get impact, architecture, APIs, Git
history, duplicates, dead code, search, semantic links, temporal memory,
exported n8n workflows (`n8n_*`), Dify YAML apps (`dify_*`), Agent
Plugins/Skills/MCP catalogs (`agent_*`), Mermaid flowcharts (`diagram_*`),
and Web3 ABI/consumer impact (`web3_*`). Those parsers are domains on
Weavatrix Core, not new MCP products. See
[n8n](https://weavatrix.com/n8n), [Dify](https://weavatrix.com/dify), and
[parsers](https://weavatrix.com/parsers).

It does not answer from a larger grep or an invented confidence score. Every
bounded result can carry the repository revision, file, line, extractor,
evidence kind, and confidence that produced it.

This npm package is the convenient **prebuilt native tarball**. That is the
only reason it exists on npm. It is not a TypeScript rewrite, not a Serena
wrapper, and not a Repomix-style packer with an MCP flag. The crate
`weavatrix` on crates.io is the same adapter; `weavatrix-js` is the legacy
JavaScript implementation used for historical baselines and is not bundled
here.

Install this package when the machine should run MCP without a Rust
toolchain. Link `weavatrix-rust` when you are embedding the engine. Use the
Cursor/Codex/Claude plugin when the workspace folder must be the root, not
`npx`’s current directory.

## Install in 30 seconds

```sh
npx -y weavatrix mcp .
```

Or install the same native MCP product through Cargo:

```sh
cargo install weavatrix
weavatrix mcp .
```

### Codex

```toml
[mcp_servers.weavatrix]
command = "npx"
args = ["-y", "weavatrix@1.16.2", "mcp", "."]
```

Pass an absolute repository path when the Codex process cwd is not the project
you intend to analyze.

### Claude Code

```sh
claude mcp add weavatrix -- npx -y weavatrix@1.16.2 mcp .
```

### Cursor

Prefer the plugin, or pin the open workspace explicitly and do not also enable
the plugin for the same server name:

```json
{
  "mcpServers": {
    "weavatrix": {
      "command": "npx",
      "args": ["-y", "weavatrix@1.16.2", "mcp", "${workspaceFolder}"]
    }
  }
}
```

Profiles expose bounded views of the same engine:

```sh
npx -y weavatrix@1.16.2 mcp . --profile=all
npx -y weavatrix@1.16.2 mcp . --profile=code
npx -y weavatrix@1.16.2 mcp . --profile=seo
npx -y weavatrix@1.16.2 mcp . --profile=n8n
npx -y weavatrix@1.16.2 mcp . --profile=dify
npx -y weavatrix@1.16.2 mcp . --profile=agent
npx -y weavatrix@1.16.2 mcp . --profile=diagram
npx -y weavatrix@1.16.2 mcp . --profile=web3
```

The package contains native binaries for Windows x64/arm64, macOS x64/arm64,
and glibc Linux x64/arm64. It has no install script and performs no runtime
download.

### Halve every answer on a client that reads structured output

An MCP result carries the payload twice: once as `structuredContent`, and once
mirrored into a text block for clients that read only `content`. The mirror is
the pretty-printed copy, so it is the larger of the two.

```sh
npx -y weavatrix mcp . --output-format=structured
```

Measured on `run_audit` over a real repository, the response falls from 8931 to
3589 bytes, **59.8% smaller**. Whether a client reads structured output does
not change between calls, so it is chosen once at startup rather than restated
as an argument on every call; `WEAVATRIX_OUTPUT_FORMAT=structured` does the
same, and a call that names its own `output_format` still wins.

`json` is the default and keeps the mirror, because a client that ignores
`structuredContent` would otherwise see an empty result.

### What the new domains actually answer

| Ask | Tool | Honest limit |
| --- | --- | --- |
| Will this MCP schema still accept yesterday’s request? | `agent_change_impact` | `string` → `integer` is incompatible. A missing tool in a partial catalog is `unconfirmed`, not removed. |
| Who calls this ABI after an event layout change? | `web3_impact` | Comment/string “calls” are not consumers. ABI equality is not a live deployment. |
| Who reads this field in an exported n8n workflow? | `n8n_trace` | Secrets stay off the graph. |
| Which Dify nodes consume `start_node.query`? | `dify_trace` | Conversation variables are directed edges, not string presence. |
| Does this Mermaid arrow prove a code call? | `diagram_*` | Arrows are `declared_architecture`, never `Calls`. |
| Does `.weavatrix/architecture.json` still hold? | `verify_architecture` | Unknown rules fail closed. |

## What an agent can ask

```text
What breaks if I change src/auth/middleware.ts?
Trace POST /api/orders through this backend and its clients.
Which production symbols are dead, and what evidence proves it?
Show duplicate implementations but suppress router boilerplate.
Which dependency violates .weavatrix/architecture.json?
Find every GraphQL, gRPC, Kafka, RabbitMQ, NATS, JMS, SQS, or SNS
contract affected by this branch.
Build the smallest source bundle needed to edit this symbol safely.
Show me this file as it was two commits ago, without a checkout.
If I change the email recipient in this exported n8n workflow, who reads it?
If I change start_node.query in this Dify YAML, which nodes consume it?
Did this MCP catalog make `id` an integer so old string requests fail?
Which viem `decodeEventLog` sites still assume the old Deposit layout?
Is this Mermaid arrow a real call, or only declared architecture?
```

## See it answer

Real answers from Weavatrix analyzing its own repository at commit
`ec8bf30`, abridged (`…`) and with the local root shortened. Reproduce any of
them with `weavatrix tool <name> . '<arguments>'`.

**Orient in one call** — and know exactly which repository and revision
answered:

```json
{"name": "graph_stats", "arguments": {}}
```

```json
{
  "nodes": 1294,
  "edges": 2771,
  "freshness": {"state": "CURRENT", "source_revision": "sha256:dd3d96d3…"},
  "relations": {"calls": 651, "contains": 1271, "imports": 419, "references": 314, "…": "…"},
  "repository_context": {
    "root": "…/weavatrix",
    "git_head": "ec8bf3041588623f23ec5e7ebbaff3a333da9ca7",
    "scan_revision": "sha256:dd3d96d3…",
    "graph_age_seconds": 0
  }
}
```

Every answer carries that `repository_context` block. From **1.11.1**, each MCP
process pins its launch root for the session: `open_repo` to another path is
refused unless you started with `--allow-retarget`, and omitted
`expected_repository` is filled from that pin. Still pass
`"expected_repository": "weavatrix"` when you already know the folder name — a
mismatched server fails loudly instead of answering about the wrong repository.

**Blast radius before you edit:**

```json
{"name": "get_dependents", "arguments": {"label": "file:src/mcp/server/mod.rs", "max_nodes": 6}}
```

```json
{
  "dependents": [
    {"distance": 1, "node": {"id": "file:src/main.rs", "language": "rust"}},
    {"distance": 1, "node": {"id": "file:src/mcp/mod.rs"}},
    {"distance": 1, "node": {"id": "file:src/mcp/server/tests/catalog.rs"}},
    {"…": "…"}
  ]
}
```

**The file as it was — no checkout** (`git_read_blob`):

```json
{"name": "git_read_blob", "arguments": {"path": "Cargo.toml", "revision": "HEAD~3", "max_bytes": 400}}
```

```json
{
  "path": "Cargo.toml",
  "revision": "70b5bc788a10ec89ab28b9ecbc005e3b9c7f9829",
  "oid": "f5f54bac00a4feb6e965c0d87c5c6d4d25782e91",
  "kind": "utf8-text",
  "lines": ["[package]", "name = \"weavatrix\"", "version = \"1.9.2\"", "…"],
  "size_bytes": 1224,
  "returned_bytes": 400,
  "truncated": true
}
```

Three commits before `ec8bf30` this package was 1.9.2; the agent reads that
follow-up to a diff without touching the worktree. Binary blobs fail closed
instead of being decoded into garbage.

## The 64 read-only operations

| Workflow | Operations |
| --- | --- |
| Graph orientation | `graph_stats`, `get_node`, `get_neighbors`, `query_graph`, `god_nodes`, `shortest_path`, `get_community`, `list_communities`, `module_map`, `build_graph` |
| Change impact | `get_dependents`, `change_impact`, `select_tests`, `verified_change`, `prepare_change`, `graph_diff` |
| Exact source context | `search_code`, `read_source`, `inspect_symbol`, `go_to_definition`, `find_references`, `context_bundle`, `map_stacktrace` |
| Health and quality | `find_duplicates`, `find_dead_code`, `run_audit`, `coverage_map`, `hot_path_review`, `perf_attribution` |
| APIs and transports | `list_endpoints`, `trace_endpoint`, `trace_api_contract` |
| Architecture | `get_architecture_contract`, `verify_architecture`, `verify_capabilities`, `explain_architecture_violation`, `propose_architecture_exception` |
| Git and repositories | `git_history`, `git_read_blob`, `cross_repo_git`, `open_repo`, `list_known_repos`, `rebuild_graph` |
| Native extensions | `vector_search`, `semantic_link`, `seo_link_suggestions`, `memory_context` |
| n8n workflows | `n8n_inventory`, `n8n_trace`, `n8n_context` |
| Dify apps | `dify_inventory`, `dify_trace`, `dify_context` |
| Agent packages | `agent_inventory`, `agent_trace`, `agent_context`, `agent_change_impact` |
| Mermaid diagrams | `diagram_inventory`, `diagram_trace`, `diagram_context` |
| Web3 integration | `web3_inventory`, `web3_trace`, `web3_impact`, `web3_context` |

Every operation is read-only with respect to the analyzed repository.
Pagination and explicit limits bound large neighborhoods, histories, searches,
and contract inventories.

## 24 repository surfaces

| Group | Surfaces |
| --- | --- |
| Code | Rust; JavaScript/JSX; TypeScript/TSX; Python; Go; Java; C#; C; C++; SQL; Bash/Zsh; Swift; Solidity |
| Contracts and configuration | GraphQL; Protobuf/gRPC; JSON/JSONC (n8n after parse); YAML/Kubernetes (Dify after parse); Terraform/HCL; XML |
| Documents and UI | HTML/Vue/Svelte; CSS/SCSS/Sass/Less; Markdown/MDX; reStructuredText; AsciiDoc |

Cross-surface analysis connects HTTP, GraphQL, gRPC, Kafka, RabbitMQ/AMQP,
JMS, NATS, SQS, and SNS evidence. Dynamic dispatch that cannot be proved stays
unresolved; static reachability is never presented as measured coverage.

## Workflow export domains

n8n and Dify are after-parse domains on the same graph, not new MCP servers.

```text
export in git → existing JSON/YAML parse → typed domain → inventory / trace / context
```

| Domain | Tools | Status |
| --- | --- | --- |
| [n8n](https://weavatrix.com/n8n) | `n8n_inventory`, `n8n_trace`, `n8n_context` | Product 1.12.0 |
| [Dify](https://weavatrix.com/dify) | `dify_inventory`, `dify_trace`, `dify_context` | Product 1.13.0 |
| Agent packages | `agent_inventory`, `agent_trace`, `agent_context`, `agent_change_impact` | Product 1.14.0 |
| Mermaid diagrams | `diagram_inventory`, `diagram_trace`, `diagram_context` | Product 1.14.0 |
| Web3 integration | `web3_inventory`, `web3_trace`, `web3_impact`, `web3_context` | Product 1.16.2 |

| Need | Use |
| --- | --- |
| Change impact on an export in git | Weavatrix `n8n_*` / `dify_*` |
| Live n8n instance | [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) |
| Live Dify console | [dify-mcp](https://github.com/alexjiaguo/dify-mcp) |
| CI lint/diff of Dify YAML | [difyctl](https://github.com/JSLEEKR/difyctl) |

No invented n8n/Dify millisecond benches. Those tools share the measured
installed MCP boundary (2026-08-03): cold **32.21x** (157.34 ms vs 5,068.22 ms)
and warm **36.85x** (7.94 ms vs 292.55 ms) versus `weavatrix-js` 0.3.15.

## Product and engine are separate

```text
coding agent
    |
    | MCP over stdio
    v
weavatrix 1.16.2
    profile catalog · refresh · watcher · MCP framing
    |
    v
weavatrix-rust 2.16.2
    typed graph · analysis · 64 product operations including n8n, Dify, agent packages, Mermaid, and Web3
```

This npm product owns MCP transport and native distribution. The
[`weavatrix-rust`](https://github.com/Weavatrix/weavatrix-rust) crate is
the reusable protocol-independent engine; it is not an MCP server.
Its standalone diagnostic therefore reports `weavatrix-rust <engine-version>`,
while this MCP product reports both its product and embedded-engine identities.

### You do not need the server to use the engines

The layers underneath are separately released npm packages with their own
repositories, licenses, and TypeScript types. Each one is a native library you
can `require` directly, with no MCP server, no agent, and no dependency on any
other Weavatrix package:

| Package | What it does on its own |
| --- | --- |
| [`weavatrix-scan`](https://www.npmjs.com/package/weavatrix-scan) | Deterministic repository manifests: normalized paths, sizes, hashes, one revision, typed skip evidence. |
| [`weavatrix-parse`](https://www.npmjs.com/package/weavatrix-parse) | Lossless tokenization and structural facts for 25 languages, with exact spans. |
| [`weavatrix-graph`](https://www.npmjs.com/package/weavatrix-graph) | A directed graph with provenance on every edge, plus BFS, SCC, topological sort, and PageRank. |
| [`weavatrix-memory`](https://www.npmjs.com/package/weavatrix-memory) | Bitemporal, evidence-carrying agent memory with a hard token budget and an audit receipt. |
| [`weavatrix-search`](https://www.npmjs.com/package/weavatrix-search) | Bounded ignore-aware content search, plus a persistent index updated from watcher events. |
| [`weavatrix-search-vector`](https://www.npmjs.com/package/weavatrix-search-vector) | Persistent, mutable vector search with metadata filters and an exact oracle. |
| [`weavatrix-clone`](https://www.npmjs.com/package/weavatrix-clone) | Type-1/2/3 clone detection with per-pair evidence and JSON, SARIF, and BigCloneEval output. |

Their Node and Bun benchmarks against the JavaScript library each would
otherwise replace live in one place, with the rules written down and the
losing rows kept:
[weavatrix-benchmarks](https://github.com/Weavatrix/weavatrix-benchmarks).

## Release evidence

The installed-package benchmark packs both products, installs them into
isolated npm roots, starts fresh MCP processes with empty caches, and validates
identity, advertised operations, results, and cleanup.

The packaged 1.2.0 product (`weavatrix-rust` 2.1.1) was measured on 2026-08-03
against installed `weavatrix-js` 0.3.15 on a real JavaScript service
repository: paired cold-boundary median **32.06x** (spawn to first tool
result: **157.34 ms** vs 5,068.22 ms) and warm tools/call median **36.85x**
(**7.94 ms** vs 292.55 ms), passing the 24x cold and 30x warm release
thresholds and sitting slightly above the 30.34x recorded for the 1.0.0
baseline.

Full evidence and methodology:
[benchmarks](https://github.com/Weavatrix/weavatrix/blob/main/docs/benchmarks.md).

## Safety

- read-only MCP surface;
- no repository-code execution or source writes;
- no network path in analysis;
- no npm install script or runtime binary download;
- bounded inputs, outputs, histories, and pagination;
- stable ordering and revision provenance;
- `unsafe` Rust forbidden in first-party engine crates;
- MIT licensed.

## Links

- [Source and issues](https://github.com/Weavatrix/weavatrix)
- [Engine API](https://github.com/Weavatrix/weavatrix-rust)
- [Tool reference](https://github.com/Weavatrix/weavatrix/blob/main/docs/tool-reference.md)
- [Language support](https://github.com/Weavatrix/weavatrix/blob/main/docs/language-support.md)
- [Architecture](https://github.com/Weavatrix/weavatrix/blob/main/docs/architecture.md)
- [n8n](https://weavatrix.com/n8n) · [Dify](https://weavatrix.com/dify) · [parsers](https://weavatrix.com/parsers)
- [Benchmarks](https://github.com/Weavatrix/weavatrix/blob/main/docs/benchmarks.md)

## License

MIT.
