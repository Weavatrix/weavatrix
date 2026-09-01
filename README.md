# Weavatrix — native MCP repository intelligence

<img src="plugins/weavatrix/assets/logo.svg" alt="Weavatrix logo" width="88" align="right">

[![CI](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml/badge.svg)](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/weavatrix.svg)](https://www.npmjs.com/package/weavatrix)
[![crates.io](https://img.shields.io/crates/v/weavatrix.svg)](https://crates.io/crates/weavatrix)
[![engine](https://img.shields.io/crates/v/weavatrix-rust.svg?label=engine)](https://crates.io/crates/weavatrix-rust)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Part of the [Weavatrix ecosystem](https://weavatrix.com/ecosystem): evidence infrastructure for AI software agents.

**Give your coding agent repository evidence before it starts guessing.**

Weavatrix is the native MCP product for repository intelligence. It gives
Codex, Claude Code, and other coding agents 44 read-only operations over one
revision-bound evidence graph: impact, architecture, APIs, Git history,
duplicates, dead code, search, semantic links, and temporal memory.

It does not answer from a larger grep or an invented confidence score. Every
bounded result can carry the repository revision, file, line, extractor,
evidence kind, and confidence that produced it.

### Ecosystem place (UNDERSTAND)

```text
Weavatrix (this) — code facts
        │
        ▼
Weavatrix Loom — semantic composition (capabilities, registry, compile → Rust)
        │
        ▼
Realforge — artifact construction (scaffold / package / deploy)
```

| Product | Owns | Does **not** own |
| --- | --- | --- |
| **Weavatrix** (this) | Repository / code graph, symbols, deps, search, impact | Capability interchange **Registry**, WVX project graph |
| **[Weavatrix Loom](https://github.com/Weavatrix/weavatrix-loom)** | Capability · Implementation · evidence · GraphPatch · semantic compiler | Deep repo indexing (that stays here) |
| **[FerroSift](https://github.com/sergii-ziborov/ferrosift)** | Deterministic transform recipes/ops | Capability Registry; code intelligence |
| **[Cortex Loom](https://github.com/sergii-ziborov/cortex-loom)** | Agent workflow / context budgets | Code index; Loom admit policy |

Loom **consumes** Weavatrix facts for semantic classification (e.g. “this `fn`
is a candidate for `data.json.parse@1`”). Loom must not grow a second product
code indexer. Normative Loom side: [ADR-0012](https://github.com/Weavatrix/weavatrix-loom/blob/main/docs/adr/0012-ecosystem-boundaries.md).

The same source is distributed in two forms:

| Distribution | Install | Best for |
| --- | --- | --- |
| `weavatrix` on crates.io | `cargo install weavatrix` | Rust-first environments and source builds |
| `weavatrix` on npm | `npx -y weavatrix mcp .` | Ready-made cross-platform binaries without a Rust toolchain |

The npm package exists for convenience; it does not contain a different
JavaScript engine. Both distributions run the same native adapter and the same
`weavatrix-rust` analysis engine. The separately versioned `weavatrix-js`
package is the legacy JavaScript implementation used for compatibility and
historical baselines; it is not bundled into `weavatrix`.

## Install as a plugin

The repository ships one plugin bundle for Cursor, Codex, Claude Code, and
Grok Build. Each client starts the published native npm distribution and loads
the same read-only MCP tools. Its optional Weavatrix skill activates only for
tasks that benefit from indexed, cross-file evidence; detailed tool routing is
loaded separately when needed.

### Cursor plugin

Search for **Weavatrix** in Cursor's Plugins view after its marketplace review
is complete. The bundle can be tested before listing by copying or linking
[`plugins/weavatrix`](plugins/weavatrix) to
`~/.cursor/plugins/local/weavatrix` and reloading the Cursor window.

### Codex plugin

```sh
codex plugin marketplace add Weavatrix/weavatrix --sparse .agents/plugins plugins/weavatrix
codex plugin add weavatrix@weavatrix
```

### Claude Code plugin

```sh
claude plugin marketplace add Weavatrix/weavatrix --sparse .claude-plugin plugins
claude plugin install weavatrix@weavatrix
```

### Grok Build plugin

```sh
grok plugin marketplace add Weavatrix/weavatrix
```

Open `/marketplace` and install Weavatrix. Grok also accepts the plugin
directly with
`grok plugin install Weavatrix/weavatrix#plugins/weavatrix`.

## Install in 30 seconds

Run the convenient prebuilt npm distribution:

```sh
npx -y weavatrix mcp .
```

Or install the same MCP product through Cargo:

```sh
cargo install weavatrix
weavatrix mcp .
```

### Codex

```toml
# ~/.codex/config.toml
[mcp_servers.weavatrix]
command = "npx"
args = ["-y", "weavatrix", "mcp", "."]
```

### Claude Code

```sh
claude mcp add weavatrix -- npx -y weavatrix mcp .
```

### Grok

```sh
grok mcp add weavatrix -- npx -y weavatrix mcp .
```

Everything after `--` is the server command, so `-y` reaches `npx` instead of
Grok. The equivalent hand-written entry:

```toml
# ~/.grok/config.toml
[mcp_servers.weavatrix]
command = "npx"
args = ["-y", "weavatrix", "mcp", "."]
startup_timeout_sec = 120
```

The package unpacks to roughly 40 MB, so the first `npx` launch can spend
longer fetching it than Grok's 30-second default startup timeout allows.
`startup_timeout_sec` covers that once; `npm i -g weavatrix` or
`cargo install weavatrix` removes the cold start for every later session.

Use `--scope project` to write `.grok/config.toml` inside a repository instead,
so a clone carries the server with it.

### Cursor

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "weavatrix": {
      "command": "npx",
      "args": ["-y", "weavatrix", "mcp", "."]
    }
  }
}
```

Profiles expose bounded views of the same engine:

```sh
npx -y weavatrix mcp . --profile=all
npx -y weavatrix mcp . --profile=code
npx -y weavatrix mcp . --profile=seo
```

The npm package contains native binaries for Windows x64/arm64, macOS
x64/arm64, and glibc Linux x64/arm64. It has no install script and performs no
runtime download.

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
same where a flag is awkward, and a call that names its own `output_format`
still wins.

`json` is the default and keeps the mirror, because a client that ignores
`structuredContent` would otherwise see an empty result. `text` returns the
concise text block alone.

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
Suggest internal links without mixing inferred SEO relationships into
the deterministic code graph.
```

The graph is built once per revision. Impact, API traces, health findings,
architecture checks, clone families, and context bundles therefore agree about
repository identity instead of recomputing incompatible partial views.

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

Every answer carries that `repository_context` block. Add
`"expected_repository": "weavatrix"` to any call and a server that was
retargeted elsewhere fails loudly instead of answering about the wrong
repository.

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

## The 44 read-only operations

| Workflow | Operations |
| --- | --- |
| Graph orientation | `graph_stats`, `get_node`, `get_neighbors`, `query_graph`, `god_nodes`, `shortest_path`, `get_community`, `list_communities`, `module_map`, `build_graph` |
| Change impact | `get_dependents`, `change_impact`, `select_tests`, `verified_change`, `prepare_change`, `graph_diff` |
| Exact source context | `search_code`, `read_source`, `inspect_symbol`, `context_bundle`, `map_stacktrace` |
| Health and quality | `find_duplicates`, `find_dead_code`, `run_audit`, `coverage_map`, `hot_path_review` |
| APIs and transports | `list_endpoints`, `trace_endpoint`, `trace_api_contract` |
| Architecture | `get_architecture_contract`, `verify_architecture`, `verify_capabilities`, `explain_architecture_violation`, `propose_architecture_exception` |
| Git and repositories | `git_history`, `git_read_blob`, `cross_repo_git`, `open_repo`, `list_known_repos`, `rebuild_graph` |
| Native extensions | `vector_search`, `semantic_link`, `seo_link_suggestions`, `memory_context` |

Every operation is read-only with respect to the analyzed repository.
Pagination and explicit limits bound large neighborhoods, histories, searches,
and contract inventories.

## Languages and repository surfaces

The engine recognizes 24 named surfaces across 65 registered extensions.
Support is evidence-specific: lossless tokenization is not presented as typed
semantic resolution.

| Group | Surfaces |
| --- | --- |
| Code | Rust; JavaScript/JSX; TypeScript/TSX; Python; Go; Java; C#; C; C++; SQL; Bash/Zsh; Swift; Solidity |
| Contracts and configuration | GraphQL; Protobuf/gRPC; JSON/JSONC; YAML/Kubernetes; Terraform/HCL; XML |
| Documents and UI | HTML/Vue/Svelte; CSS/SCSS/Sass/Less; Markdown/MDX; reStructuredText; AsciiDoc |

Cross-surface passes connect HTTP routes and calls, GraphQL operations and
schema types, gRPC services and streaming modes, and Kafka, RabbitMQ/AMQP, JMS,
NATS, SQS, and SNS producers and consumers. Package manifests, lockfiles,
coverage artifacts, and architecture contracts become evidence too.

Dynamic dispatch that cannot be proved stays unresolved. Static reachability is
not called measured coverage, and absent optional evidence remains explicitly
absent.

## Product boundary

Weavatrix is deliberately split into a protocol-independent engine and a thin
product adapter:

```text
coding agent
    |
    | MCP over stdio
    v
weavatrix 1.10.0
    profile catalog · session refresh · filesystem watcher · MCP framing
    |
    v
weavatrix-rust 2.9.0
    typed graph · analysis pipeline · 44 read-only operations
    |
    +-- weavatrix-scan      repository discovery and selection
    +-- weavatrix-parse     lossless tokenization and structural facts
    +-- weavatrix-graph     graph model and algorithms
    +-- weavatrix-git       direct Git-object evidence
    +-- weavatrix-search    bounded content and index search
    +-- vector / clone / semantic / memory components
```

This repository owns the MCP transport, watcher, native npm packaging, and
client-facing identity `weavatrix`. The
[`weavatrix-rust`](https://github.com/Weavatrix/weavatrix-rust) crate owns
the reusable engine and standalone diagnostic CLI; it is not an MCP server.
Its separate binary therefore reports `weavatrix-rust <engine-version>` from
`--version`, while this product reports both the `weavatrix` product version
and its embedded engine version.

Rust applications that want to embed the engine should depend on the crate:

```toml
[dependencies]
weavatrix-rust = "2"
```

```rust
use weavatrix_rust::{Weavatrix, operations};

let mut engine = Weavatrix::open(".")?;
let result = operations::call(
    &mut engine,
    "change_impact",
    blazingly_json::json!({"target": "src/auth.rs"}),
)?;
# Ok::<(), weavatrix_rust::Error>(())
```

## Release evidence

The release gate measures the installed npm boundary, not an in-process
microbenchmark. Each side is packed, installed into an isolated npm root, and
started with empty HOME, XDG, AppData, and graph caches. The harness validates
package/native/initialize identity, advertised operations, successful MCP
results, and process cleanup.

The packaged 1.2.0 product, backed by `weavatrix-rust` 2.1.1, was measured on
2026-08-03 against installed `weavatrix-js` 0.3.15 on the same real
JavaScript service repository (2,165 nodes / 5,712 edges), three paired fresh
processes per tool with alternating start order:

| Installed boundary | Rust 1.2.0 | JavaScript 0.3.15 | Ratio |
| --- | ---: | ---: | ---: |
| Cold boundary median (spawn to first tool result) | **157.34 ms** | 5,068.22 ms | **32.21x** |
| Paired cold speedup, median of 6 pairs | - | - | **32.06x** |
| Warm tools/call median | **7.94 ms** | 292.55 ms | **36.85x** |

Both release thresholds (24x cold, 30x warm) passed, and the paired cold
median sits slightly above the 30.34x recorded for the 1.0.0 baseline, so the
three new tools, token budgets, and dependency-injection evidence did not
regress the installed boundary. Raw evidence and methodology live in
[`benchmark-results`](benchmark-results/) and
[`docs/benchmarks.md`](docs/benchmarks.md).

## Safety and determinism

- read-only MCP surface;
- no source-writing operation;
- no execution of repository code;
- no spawned `git`, `rg`, language server, Node, or Python from the native
  engine;
- no network path in repository analysis;
- no npm install script or post-install binary download;
- bounded files, bytes, results, histories, and pagination;
- stable ordering and revision provenance;
- `unsafe` Rust forbidden in first-party engine crates;
- MIT license for the product, engine, and maintained first-party components.

Filesystem watching only invalidates derived state. The next operation performs
a bounded refresh; it never edits the repository. Watching costs constant
memory: every event is classified as it arrives and collapses into one pending
change flag, so build output churning under `target/` or `node_modules/` never
accumulates in a server that is sitting idle between tool calls.

## Architecture and development

The product adapter follows ports and adapters:

```text
inbound MCP server
        |
application session
        |
repository + change-monitor ports
        |
weavatrix-rust adapter · notify adapter
```

`mcport` is isolated to the inbound server. The application layer sees neither
MCP frames nor `notify` events, and the engine sees neither dependency.

Local gates:

```sh
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test --all-targets
```

Native npm artifacts are built by `scripts/build-npm-packages.mjs`; publication
is performed by the protected GitHub Actions workflow after all platform
binaries, identity checks, package checks, and installed-boundary gates pass.

## Documentation

- [Getting started](docs/getting-started.md)
- [Tool reference](docs/tool-reference.md)
- [Evidence model](docs/evidence-model.md)
- [Language support](docs/language-support.md)
- [MCP product architecture](docs/mcp-and-standalone.md)
- [npm distribution](docs/npm-distribution.md)
- [Dependencies](docs/dependencies.md)
- [Benchmarks](docs/benchmarks.md)
- [Engine API and architecture](https://github.com/Weavatrix/weavatrix-rust)

## License

MIT. See [LICENSE](LICENSE).
