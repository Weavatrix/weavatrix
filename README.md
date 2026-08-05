# Weavatrix â€” native MCP repository intelligence

[![CI](https://github.com/sergii-ziborov/weavatrix/actions/workflows/ci.yml/badge.svg)](https://github.com/sergii-ziborov/weavatrix/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/weavatrix.svg)](https://www.npmjs.com/package/weavatrix)
[![engine](https://img.shields.io/crates/v/weavatrix-rust.svg?label=engine)](https://crates.io/crates/weavatrix-rust)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Give your coding agent repository evidence before it starts guessing.**

Weavatrix is the native MCP product for repository intelligence. It gives
Codex, Claude Code, and other coding agents 42 read-only operations over one
revision-bound evidence graph: impact, architecture, APIs, Git history,
duplicates, dead code, search, semantic links, and temporal memory.

It does not answer from a larger grep or an invented confidence score. Every
bounded result can carry the repository revision, file, line, extractor,
evidence kind, and confidence that produced it.

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

Profiles expose bounded views of the same engine:

```sh
npx -y weavatrix mcp . --profile=all
npx -y weavatrix mcp . --profile=code
npx -y weavatrix mcp . --profile=seo
```

The npm package contains native binaries for Windows x64/arm64, macOS
x64/arm64, and glibc Linux x64/arm64. It has no install script and performs no
runtime download.

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
Suggest internal links without mixing inferred SEO relationships into
the deterministic code graph.
```

The graph is built once per revision. Impact, API traces, health findings,
architecture checks, clone families, and context bundles therefore agree about
repository identity instead of recomputing incompatible partial views.

## The 42 read-only operations

| Workflow | Operations |
| --- | --- |
| Graph orientation | `graph_stats`, `get_node`, `get_neighbors`, `query_graph`, `god_nodes`, `shortest_path`, `get_community`, `list_communities`, `module_map`, `build_graph` |
| Change impact | `get_dependents`, `change_impact`, `select_tests`, `verified_change`, `prepare_change`, `graph_diff` |
| Exact source context | `search_code`, `read_source`, `inspect_symbol`, `context_bundle`, `map_stacktrace` |
| Health and quality | `find_duplicates`, `find_dead_code`, `run_audit`, `coverage_map`, `hot_path_review` |
| APIs and transports | `list_endpoints`, `trace_endpoint`, `trace_api_contract` |
| Architecture | `get_architecture_contract`, `verify_architecture`, `explain_architecture_violation`, `propose_architecture_exception` |
| Git and repositories | `git_history`, `cross_repo_git`, `open_repo`, `list_known_repos`, `rebuild_graph` |
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
weavatrix 1.3.0
    profile catalog Â· session refresh Â· filesystem watcher Â· MCP framing
    |
    v
weavatrix-rust 2.2.0
    typed graph Â· analysis pipeline Â· 42 read-only operations
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
[`weavatrix-rust`](https://github.com/sergii-ziborov/weavatrix-rust) crate owns
the reusable engine and standalone diagnostic CLI; it is not an MCP server.
Its separate binary therefore reports `weavatrix-rust <engine-version>` from
`--version`, while this product reports both the `weavatrix` product version
and its embedded engine version.

The 2.0.2 engine also closes an integrity gap in duplicate results. After
test/classified/low-signal filtering and after `top_n` truncation, Weavatrix
rebuilds clone families from the pairs that remain. Every returned member and
pair now belongs to the same deterministic connected component; filtered
members and dangling pair identifiers cannot leak into `find_duplicates`.

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
a bounded refresh; it never edits the repository.

## Architecture and development

The product adapter follows ports and adapters:

```text
inbound MCP server
        |
application session
        |
repository + change-monitor ports
        |
weavatrix-rust adapter Â· notify adapter
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
- [Engine API and architecture](https://github.com/sergii-ziborov/weavatrix-rust)

## License

MIT. See [LICENSE](LICENSE).
