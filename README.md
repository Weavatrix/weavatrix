# Weavatrix — native MCP repository intelligence

<img src="plugins/weavatrix/assets/logo.svg" alt="Weavatrix logo" width="88" align="right">

[![CI](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml/badge.svg)](https://github.com/Weavatrix/weavatrix/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/weavatrix.svg)](https://www.npmjs.com/package/weavatrix)
[![crates.io](https://img.shields.io/crates/v/weavatrix.svg)](https://crates.io/crates/weavatrix)
[![engine](https://img.shields.io/crates/v/weavatrix-rust.svg?label=engine)](https://crates.io/crates/weavatrix-rust)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Part of the [Weavatrix ecosystem](https://weavatrix.com/ecosystem): evidence infrastructure for AI software agents.

**Give your coding agent repository evidence before it starts guessing.**

Weavatrix is the native MCP product that answers the questions agents
otherwise invent: what breaks if this file changes, who consumes this n8n
field, whether an MCP schema still accepts yesterday’s request, which
viem call sites follow an ABI layout change, and whether
`.weavatrix/architecture.json` still holds. **67 read-only operations**,
one revision-bound graph, no LSP and no prompt pack.

Codex, Claude Code, Cursor, and Grok get impact, architecture, APIs, Git
history, duplicates, dead code, search, semantic links, temporal memory,
exported n8n workflows (`n8n_*`), Dify YAML apps (`dify_*`), Agent
Plugins/Skills/MCP catalogs (`agent_*`), Mermaid flowcharts (`diagram_*`),
and Web3 ABI/consumer impact (`web3_*`). Those parsers are domains on
Weavatrix Core, not new MCP products. Dedicated pages:
[n8n](https://weavatrix.com/n8n) · [Dify](https://weavatrix.com/dify) ·
[parsers](https://weavatrix.com/parsers).

It does not answer from a larger grep or an invented confidence score. Every
bounded result can carry the repository revision, file, line, extractor,
evidence kind, and confidence that produced it.

### Adjacent MCP tools (not this host)

This repository is the **stdio MCP host and plugin pack**. It pins
`weavatrix-rust`. It does not grow a second indexer, and it does not compete
with the engine crate for the same README story.

| You may already use | Use it for | Use this host instead when |
| --- | --- | --- |
| Serena | LSP-accurate rename, refs, and edits inside the agent | You need read-only impact, architecture, and provenance — and you do not want the agent to start a language server |
| Repomix MCP | Stuffing a compressed repo into the next prompt | You need a bounded answer (`change_impact`, `verify_architecture`) without paying the pack-token tax every turn |
| Aider RepoMap | Ranking symbols that fit one chat | You need the full revision-bound graph, including n8n / Dify / Agent / Web3 / Mermaid domains |
| Claude Context / vector MCP | Semantic “code like this” retrieval | You need extractor-backed edges, not nearest-neighbor chunks |
| GitNexus / CodeGraph daemons | A long-lived graph service beside the IDE | You want the published native binary, no extra database process |

The host’s unique job is transport: profiles, watching, npm/crate
distributions, and the 67-tool catalog over one engine session. Measured
engine times live in
[weavatrix-rust benchmarks](https://github.com/Weavatrix/weavatrix-rust/blob/main/docs/benchmarks.md),
not here.

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
| `weavatrix` on npm | `npx -y weavatrix@1.17.4 mcp <repo>` | Ready-made cross-platform binaries without a Rust toolchain |

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

Prefer the Cursor plugin (it already passes `${workspaceFolder}`). For a
hand-written user entry, pin the server to the open workspace — not the host
process cwd — and avoid running both a user MCP and the plugin at once:

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "weavatrix": {
      "command": "npx",
      "args": ["-y", "weavatrix@1.17.4", "mcp", "${workspaceFolder}"]
    }
  }
}
```

Profiles expose bounded views of the same engine:

```sh
npx -y weavatrix@1.17.4 mcp . --profile=all
npx -y weavatrix@1.17.4 mcp . --profile=code
npx -y weavatrix@1.17.4 mcp . --profile=seo
npx -y weavatrix@1.17.4 mcp . --profile=n8n
npx -y weavatrix@1.17.4 mcp . --profile=dify
npx -y weavatrix@1.17.4 mcp . --profile=agent
npx -y weavatrix@1.17.4 mcp . --profile=diagram
npx -y weavatrix@1.17.4 mcp . --profile=web3
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
`structuredContent` would otherwise see an empty result. `text` returns only
the text block, but that block still contains serialized JSON; it is not a
summary mode. For an architecture question, call `architecture_inventory`
without arguments and summarize its bounded style hypotheses in prose.

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
Suggest internal links without mixing inferred SEO relationships into
the deterministic code graph.
If I change the email recipient in this exported n8n workflow, who reads it?
If I change start_node.query in this Dify YAML, which nodes consume it?
Did this MCP catalog make `id` an integer so old string requests fail?
Which viem `decodeEventLog` sites still assume the old Deposit layout?
Is this Mermaid arrow a real call, or only declared architecture?
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

## The 67 read-only operations

| Workflow | Operations |
| --- | --- |
| Graph orientation | `graph_stats`, `get_node`, `get_neighbors`, `query_graph`, `god_nodes`, `shortest_path`, `get_community`, `list_communities`, `module_map`, `build_graph` |
| Change impact | `get_dependents`, `change_impact`, `select_tests`, `verified_change`, `prepare_change`, `graph_diff` |
| Exact source context | `search_code`, `read_source`, `inspect_symbol`, `go_to_definition`, `find_references`, `context_bundle`, `map_stacktrace` |
| Health and quality | `find_duplicates`, `find_dead_code`, `run_audit`, `coverage_map`, `hot_path_review`, `perf_attribution` |

| APIs and transports | `list_endpoints`, `trace_endpoint`, `trace_api_contract` |
| Architecture | `architecture_inventory`, `get_architecture_contract`, `verify_architecture`, `verify_capabilities`, `explain_architecture_violation`, `propose_architecture_exception` |
| Local CI | `ci_restrictions`, `explain_restriction` |
| Git and repositories | `git_history`, `git_read_blob`, `cross_repo_git`, `open_repo`, `list_known_repos`, `rebuild_graph` |
| Native extensions | `vector_search`, `semantic_link`, `seo_link_suggestions`, `memory_context` |
| n8n workflows | `n8n_inventory`, `n8n_trace`, `n8n_context` |
| Dify apps | `dify_inventory`, `dify_trace`, `dify_context` |
| Agent packages | `agent_inventory`, `agent_trace`, `agent_context`, `agent_change_impact` |
| Mermaid diagrams | `diagram_inventory`, `diagram_trace`, `diagram_context` |
| Web3 integration | `web3_inventory`, `web3_trace`, `web3_impact`, `web3_context` |

`coverage_map` is an ingest, not a test runner. Pair it with Weavatrix
Quality `quality_run`, which writes `.weavatrix/coverage/lcov.info` onto
the engine search path. A missing report is unmeasured, not 0%.

Every operation is read-only with respect to the analyzed repository.
Pagination and explicit limits bound large neighborhoods, histories, searches,
and contract inventories.

`build_graph` and `architecture_inventory` now share one typed build model.
`architecture_inventory` defaults to `detail:"summary"`: complete graph
totals, representative component paths, dominant coupling, and clearly
labeled cycle candidates in a bounded response. It also reports independent
style hypotheses for modular source organization, onion dependencies,
ports-and-adapters, layered dependencies, and deployment topology. Each
hypothesis states its evidence, contradictions, unknowns, and status; the
declared contract style is never treated as proof. Request `detail:"full"` for
paged edges and source evidence; `output_format:"text"` does not reduce detail.
They preserve nested Cargo, npm/TypeScript, Go, and Python components,
many-to-many declared memberships, collision-free identities, configuration
predicates, and immutable source evidence. Component totals and SCC/cycle
witnesses are computed on the complete projection before pagination, so a
response cap cannot change the graph verdict. Quotient component cycles are
reported as architectural cycles, not mislabeled as symbol recursion.

`ci_restrictions` reuses that target-aware topology while reading local GitHub
Actions workflows and literal checks. Root files, repeated commands, UTF-8 BOM
offsets, optional events, base branches, and changed-path scenarios retain
their exact evidence. Dynamic conditions, mutually exclusive configuration
unions, actual runs, and remote required checks remain explicit unknowns; a
workflow file alone never establishes a passing gate.

## Languages and repository surfaces

The engine recognizes 24 named surfaces across 65 registered extensions.
Support is evidence-specific: lossless tokenization is not presented as typed
semantic resolution.

| Group | Surfaces |
| --- | --- |
| Code | Rust; JavaScript/JSX; TypeScript/TSX; Python; Go; Java; C#; C; C++; SQL; Bash/Zsh; Swift; Solidity |
| Contracts and configuration | GraphQL; Protobuf/gRPC; JSON/JSONC (n8n after parse); YAML/Kubernetes (Dify after parse); Terraform/HCL; XML |
| Documents and UI | HTML/Vue/Svelte; CSS/SCSS/Sass/Less; Markdown/MDX; reStructuredText; AsciiDoc |

Cross-surface passes connect HTTP routes and calls, GraphQL operations and
schema types, gRPC services and streaming modes, and Kafka, RabbitMQ/AMQP, JMS,
NATS, SQS, and SNS producers and consumers. Package manifests, lockfiles,
coverage artifacts, and architecture contracts become evidence too.

Dynamic dispatch that cannot be proved stays unresolved. Static reachability is
not called measured coverage, and absent optional evidence remains explicitly
absent.

## Workflow export domains

n8n and Dify are not new MCP servers, editors, or runtimes. They are domains
on the same evidence graph. JSON still goes through the JSON adapter; YAML
still goes through the Kubernetes adapter. After parse, a recognized export
becomes typed nodes, ports, and relations. A `package.json` does not become
an n8n workflow. A Kubernetes `ConfigMap` does not become a Dify app.

```mermaid
flowchart LR
  export["n8n JSON / Dify YAML in git"] --> parse["Existing JSON / YAML parse"]
  parse --> domain["After-parse domain"]
  domain --> graph["Revision-bound evidence graph"]
  graph --> inventory["inventory"]
  graph --> trace["trace"]
  graph --> context["context"]
```

Product pages: [n8n](https://weavatrix.com/n8n) · [Dify](https://weavatrix.com/dify) ·
[parsers](https://weavatrix.com/parsers).

### n8n (shipped in 1.12.0)

Exported workflow JSON → `n8n_inventory`, `n8n_trace`, `n8n_context`.

Use this when the question is about an export already in git: who reads this
field, which node feeds that output, what this file actually contains. The
agent stays on the repository revision. It does not log into n8n.

- Identities are scoped per file. The same display name in two workflows
  stays two nodes; a short label that hits both is `ambiguous`.
- `flows_to` is control flow. `depends_on_output` is data. They are not
  walked as one relation.
- Every `$('Name')` / `$node` / `$items` occurrence is bound, not the first
  match only. `.item` and `.first()` stay distinct. A dynamic
  `$('' + prefix)` is `unresolved:dynamic_node`.
- `typeVersion` `1.7` is not coerced to an integer.
- Missing subworkflows are “not provided”, not “deleted”.
- Secrets, cookies, auth headers, URL credentials, `pinData`, `staticData`,
  and `$env` values stay off the default graph and context.

```sh
npx -y weavatrix@1.17.4 mcp . --profile=n8n
```

### Dify (shipped in 1.13.0)

Exported DSL YAML → `dify_inventory`, `dify_trace`, `dify_context`.

Use this when the question is about a local YAML export: which nodes consume
`start_node.query`, which Code or Template regions mention a selector, what
the export omitted. The agent stays on the repository revision. It does not
call the Dify console.

- `AppKey` is corpus + artifact origin. `data.title` is display only.
- Node subject type is `node.data.type`, not the canvas `custom` UI type.
- Iteration / loop children keep `parentId` scope. They are not flattened.
- `{{#start_node.query#}}` markers and structured selectors become
  `reads_variable` / `depends_on_output` with source spans.
- Conversation assigner reads and writes stay typed. Code and Template
  regions are inventoried, not executed.
- Chat and other modes are recognized. An unsupported mode is
  `structure_only`, not a successful empty graph.
- Environment values and credential-shaped labels are omitted from default
  inventory and context.

```sh
npx -y weavatrix@1.17.4 mcp . --profile=dify
```

### Agent packages (shipped in 1.14.0)

Local plugin, skill, catalog, and observation files → `agent_inventory`,
`agent_trace`, `agent_context`, `agent_change_impact`.

Use this when the question is about a package already in git: which catalog
tools a plugin exposes, which MCP config binds a server, whether two catalog
snapshots stayed compatible on the supported schema subset. Unsupported
keywords stay `undetermined`. Duplicate tool labels are
`ambiguous-identity`. The agent does not launch commands, and
`allowed-tools` is a declaration, not a proven call.

```sh
npx -y weavatrix@1.17.4 mcp . --profile=agent
```

### Mermaid diagrams (shipped in 1.14.0)

`.mmd`, `.mermaid`, and Markdown/MDX fences → `diagram_inventory`,
`diagram_trace`, `diagram_context`.

Drawn arrows are `declared_architecture`, never Calls. They do not clear
dead-code findings. Bindings come only from `.weavatrix/diagram-links.json`.
Name match is not exact. `change_impact.documentation` is separate from
production impact.

```sh
npx -y weavatrix@1.17.4 mcp . --profile=diagram
```

### Web3 integration (shipped in 1.15.0)

ABI JSON, supplied solc/Foundry artifacts, and static viem/wagmi
consumers → `web3_inventory`, `web3_trace`, `web3_impact`, `web3_context`.

Use this when a contract interface changed and you need the proven client
call or decoder sites. Consumers stay on the paired artifact files. A
missing candidate is `missing_input`, not a removed member. Comment
properties inside a call object are not the callee. An indexed-mask event
change can silently misdecode. ABI equality is not a live deployment
proof. The engine does not compile contracts, call RPC, or open a wallet.

```sh
npx -y weavatrix@1.17.4 mcp . --profile=web3
```

### Compared with adjacent tools

These tools solve different jobs. Weavatrix does not replace a live console
or a CI linter.

| Need | Use |
| --- | --- |
| Change impact on an n8n or Dify export already in git | Weavatrix `n8n_*` / `dify_*` on the same revision-bound graph |
| Operate a live n8n instance (run, credentials, editor API) | [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) |
| Operate a live Dify console (run, publish, 150+ API tools) | [dify-mcp](https://github.com/alexjiaguo/dify-mcp) |
| Lint or diff Dify YAML in CI | [difyctl](https://github.com/JSLEEKR/difyctl) |

Weavatrix answers “who consumes this variable in this repository revision?”
It does not execute expressions, Jinja, or Code nodes, and it does not
deploy or publish the app.

### Shared engine bench

n8n and Dify evidence is produced in-process after parse. There is no HTTP
hop to an n8n or Dify host for those tools. We do not invent per-parser
millisecond numbers.

The measured installed MCP boundary (2026-08-03, packaged 1.2.0 /
`weavatrix-rust` 2.1.1 vs `weavatrix-js` 0.3.15, same JavaScript service
repository) is the honest engine figure those domains share:

| Installed boundary | Rust 1.2.0 | JavaScript 0.3.15 | Ratio |
| --- | ---: | ---: | ---: |
| Cold boundary median (spawn to first tool result) | **157.34 ms** | 5,068.22 ms | **32.21x** |
| Warm tools/call median | **7.94 ms** | 292.55 ms | **36.85x** |

Methodology: [Release evidence](#release-evidence) and
[`docs/benchmarks.md`](docs/benchmarks.md).

### What this is not

No expression or Jinja execution. No n8n or Dify deployment. No automatic
edits. No new graph engine. Unknown DSL versions and hidden export fields
are not pretended as full support.

## Product boundary

Weavatrix is deliberately split into a protocol-independent engine and a thin
product adapter:

```text
coding agent
    |
    | MCP over stdio
    v
weavatrix 1.17.4
    profile catalog · session refresh · filesystem watcher · MCP framing
    |
    v
weavatrix-rust 2.17.3
    typed graph · analysis pipeline · 67 product operations including local CI, n8n, Dify, agent packages, Mermaid, and Web3
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
[`weavatrix-stream`](https://github.com/Weavatrix/weavatrix-stream) is a
separate crate that provides adapters for Weavatrix observations; this
host does not take a runtime dependency on it.
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
    blazingly_json::json!({"files": ["src/auth.rs"]}),
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
- [n8n export evidence](https://weavatrix.com/n8n)
- [Dify export evidence](https://weavatrix.com/dify)
- [Workflow parsers](https://weavatrix.com/parsers)
- [Engine API and architecture](https://github.com/Weavatrix/weavatrix-rust)

## License

MIT. See [LICENSE](LICENSE).
