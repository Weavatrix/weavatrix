# Weavatrix — native MCP repository intelligence

[![CI](https://github.com/sergii-ziborov/weavatrix/actions/workflows/ci.yml/badge.svg)](https://github.com/sergii-ziborov/weavatrix/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/weavatrix.svg)](https://www.npmjs.com/package/weavatrix)
[![engine](https://img.shields.io/crates/v/weavatrix-rust.svg?label=engine)](https://crates.io/crates/weavatrix-rust)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sergii-ziborov/weavatrix/blob/main/LICENSE)

**Give your coding agent repository evidence before it starts guessing.**

Weavatrix is the native MCP product for repository intelligence. It gives
Codex, Claude Code, and other coding agents 43 read-only operations over one
revision-bound evidence graph: impact, architecture, APIs, Git history,
duplicates, dead code, search, semantic links, and temporal memory.

It does not answer from a larger grep or an invented confidence score. Every
bounded result can carry the repository revision, file, line, extractor,
evidence kind, and confidence that produced it.

This npm package is the convenient prebuilt distribution of the same native
product published on crates.io as `weavatrix`. It is not a separate
JavaScript engine; both registry packages run the same Rust adapter and engine.
The separately versioned `weavatrix-js` package is a legacy compatibility
implementation and is not bundled here.

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
```

## The 43 read-only operations

| Workflow | Operations |
| --- | --- |
| Graph orientation | `graph_stats`, `get_node`, `get_neighbors`, `query_graph`, `god_nodes`, `shortest_path`, `get_community`, `list_communities`, `module_map`, `build_graph` |
| Change impact | `get_dependents`, `change_impact`, `select_tests`, `verified_change`, `prepare_change`, `graph_diff` |
| Exact source context | `search_code`, `read_source`, `inspect_symbol`, `context_bundle`, `map_stacktrace` |
| Health and quality | `find_duplicates`, `find_dead_code`, `run_audit`, `coverage_map`, `hot_path_review` |
| APIs and transports | `list_endpoints`, `trace_endpoint`, `trace_api_contract` |
| Architecture | `get_architecture_contract`, `verify_architecture`, `verify_capabilities`, `explain_architecture_violation`, `propose_architecture_exception` |
| Git and repositories | `git_history`, `cross_repo_git`, `open_repo`, `list_known_repos`, `rebuild_graph` |
| Native extensions | `vector_search`, `semantic_link`, `seo_link_suggestions`, `memory_context` |

Every operation is read-only with respect to the analyzed repository.
Pagination and explicit limits bound large neighborhoods, histories, searches,
and contract inventories.

## 24 repository surfaces

| Group | Surfaces |
| --- | --- |
| Code | Rust; JavaScript/JSX; TypeScript/TSX; Python; Go; Java; C#; C; C++; SQL; Bash/Zsh; Swift; Solidity |
| Contracts and configuration | GraphQL; Protobuf/gRPC; JSON/JSONC; YAML/Kubernetes; Terraform/HCL; XML |
| Documents and UI | HTML/Vue/Svelte; CSS/SCSS/Sass/Less; Markdown/MDX; reStructuredText; AsciiDoc |

Cross-surface analysis connects HTTP, GraphQL, gRPC, Kafka, RabbitMQ/AMQP,
JMS, NATS, SQS, and SNS evidence. Dynamic dispatch that cannot be proved stays
unresolved; static reachability is never presented as measured coverage.

## Product and engine are separate

```text
coding agent
    |
    | MCP over stdio
    v
weavatrix 1.7.0
    profile catalog · refresh · watcher · MCP framing
    |
    v
weavatrix-rust 2.5.0
    typed graph · analysis · 43 read-only operations
```

This npm product owns MCP transport and native distribution. The
[`weavatrix-rust`](https://github.com/sergii-ziborov/weavatrix-rust) crate is
the reusable protocol-independent engine; it is not an MCP server.
Its standalone diagnostic therefore reports `weavatrix-rust <engine-version>`,
while this MCP product reports both its product and embedded-engine identities.

Engine 2.2.1 makes three reports carry only what their evidence supports:
`find_duplicates` reports the lines a clone covers completely and the byte
range to check them by, `run_audit` runtime findings land on the line they
matched, and `token_budget` is refused by the operations that cannot apply it
rather than accepted and ignored. `find_duplicates` also gains
`include_strings`, which compares the payloads of multi-line literals - inline
SQL, embedded templates - that the code pass sees as a single token.

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
[benchmarks](https://github.com/sergii-ziborov/weavatrix/blob/main/docs/benchmarks.md).

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

- [Source and issues](https://github.com/sergii-ziborov/weavatrix)
- [Engine API](https://github.com/sergii-ziborov/weavatrix-rust)
- [Tool reference](https://github.com/sergii-ziborov/weavatrix/blob/main/docs/tool-reference.md)
- [Language support](https://github.com/sergii-ziborov/weavatrix/blob/main/docs/language-support.md)
- [Architecture](https://github.com/sergii-ziborov/weavatrix/blob/main/docs/architecture.md)
- [Benchmarks](https://github.com/sergii-ziborov/weavatrix/blob/main/docs/benchmarks.md)

## License

MIT.
