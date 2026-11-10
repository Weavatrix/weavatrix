---
name: weavatrix
description: >-
  Use the Weavatrix MCP when a repository task benefits from indexed evidence:
  codebase orientation, symbol/source search, dependency or call graphs, change
  impact, API/event tracing, architecture checks, Git/coverage evidence,
  duplicates, dead-code review, semantic context, exported n8n
  workflows, exported Dify YAML, Agent Plugins/Skills/MCP
  catalogs, Mermaid flowcharts, or Web3 ABI and client
  bindings. Skip it for trivial
  single-file edits or when a known source file and native tests already answer
  the task.
---

# Weavatrix

Use Weavatrix on demand as a compact evidence layer. It is most useful when a
question crosses files, symbols, modules, revisions, repositories, or runtime
contracts. Do not call it merely because the server is available.

## Minimal workflow

1. Call `graph_stats` and confirm `repository_context.root` matches the workspace
   you intend. The MCP process is pinned to its launch root; it will not silently
   answer for another repository.
2. For "what is this repository's architecture?", including "is it onion,
   modular, layered, or ports-and-adapters?", call `architecture_inventory`
   with no `detail` argument (bounded summary). Read
   `architecture_hypotheses.hypotheses`: report each relevant `SUPPORTED`,
   `CANDIDATE`, `CONTRADICTED`, or `INSUFFICIENT_EVIDENCE` status with one
   decisive dependency witness or missing signal. Explain the result,
   component areas, and limits in concise prose; do not paste the JSON. Do
   not turn a candidate into a confirmed style, or use a declared contract
   `style` as proof of the observed architecture. See
   [references/tools/architecture_inventory.md](references/tools/architecture_inventory.md)
   for the interpretation rules. Use
   `module_map` for a directory-focused question, or `search_code` for a
   known literal. Request `architecture_inventory` with `detail:"full"`
   only when a specific component, edge, or cycle needs source evidence.
   Use `get_architecture_contract` or `verify_architecture` only when the
   question is about declared target policy or compliance. A component
   quotient/union cycle is a candidate, not proof of a runtime cycle.
3. Pin decisive evidence with `inspect_symbol`, `go_to_definition`,
   `find_references`, `context_bundle`, or `read_source`.
4. Expand only when needed: `get_dependents` or `change_impact` for risk,
   `trace_endpoint` or `trace_api_contract` for runtime contracts,
   `verify_architecture` for policy, `ci_restrictions` for local GitHub Actions
   checks and `explain_restriction` for one finding, `run_audit` for a broad
   health pass,
   `n8n_inventory` / `n8n_trace` / `n8n_context` for exported n8n
   workflows, and `dify_inventory` / `dify_trace` / `dify_context` for
   exported Dify YAML, and `agent_inventory` / `agent_trace` /
  `agent_context` / `agent_change_impact` for Agent Plugins, Skills, and
  supplied MCP catalogs, and `diagram_inventory` / `diagram_trace` /
  `diagram_context` for Mermaid flowcharts, and `web3_inventory` /
  `web3_trace` / `web3_impact` / `web3_context` for supplied ABI,
  artifacts, and static viem/wagmi consumers. Those paths are static graph
  evidence, not a live n8n, Dify, MCP, Mermaid, or blockchain runtime.
5. Use repository-native tests or benchmarks for behavioral proof. For
   measured line coverage, run Weavatrix Quality `quality_run` so it writes
   `.weavatrix/coverage/lcov.info`, then call `coverage_map`. Do not start
   with `coverage_map` — it never runs tests. A missing report is
   unmeasured, not 0%. See
   [references/tools/coverage_map.md](references/tools/coverage_map.md).

Do not call `open_repo` "just in case". Cross-repository tools take explicit
roots in their arguments. Multi-root retarget requires launching with
`--allow-retarget`.

`output_format` controls the MCP envelope, not the amount of detail: `text`
is one JSON text block of the full payload, `json` mirrors that payload into
text (about twice the bytes), and `structured` drops the mirror. Choose each
tool's summary/detail or result limits for conversational work. Use
`token_budget` only as an additional ceiling; it can drop evidence arrays.
Call `rebuild_graph` only when the repository changed before automatic
refresh completed or when deliberately changing graph mode.

`search_code` reads a resident content index for this process. The first
search builds it (`backend` is `liveindex`); later searches reuse it. A
`glob` still walks the filesystem. It does not resolve symbols. Use
`find_references`, `go_to_definition`, or `inspect_symbol` for a name.
A column inside an identifier resolves; it does not have to be the first byte.

`semantic_link` with a text `query` ranks symbols by the local deterministic
token hash `weavatrix-token-hash-v1` (names, paths, and the declaration line).
That is not a neural embedding, and Weavatrix does not create one. Pass
`vectors` only when you already have embeddings. An empty `vectors` array
without `query` is an error.

`change_impact` with `files` or `target` reports the blast radius of those
files even when the worktree matches HEAD. Those seeds use
`change: "file_scope"` and `change_basis: "explicit_file"`. That is a
hypothetical scope, not a measured diff. `status` stays COMPLETE when the
tool ran. Read `evidence_completeness` and `stop_reason`. `MAX_NODES` means
the combined cap omitted nodes.

`git_history` without `path` is repository HEAD history. Pass `path` for the
commits that touch one file or directory.

`find_dead_code` treats every `main.go` and every Go `func main` as an entry.
Receiver names and function-literal parameters are not symbols.

`open_repo` is refused unless the process was started with `--allow-retarget`.
A mismatched `expected_repository` means relaunch on that repository.

`go.mod`, `Cargo.toml`, `package.json`, and `pyproject.toml` count as module
markers. One marker leaves `modular_source` at `CANDIDATE`.

Read [references/tool-routing.md](references/tool-routing.md) only when choosing
among similar tools, tracing cross-repository transports, or interpreting
audit and coverage results.

## Evidence and safety

- Keep source spans, graph revision, relation type, extractor, and confidence
  attached to findings.
- Treat static reachability and audit output as candidates, not runtime proof.
  `coverage_map` is an ingest. Quality builds the LCOV file.
- Preserve exact transport identity; do not merge Kafka, AMQP/RabbitMQ, NATS,
  SNS/SQS, JMS, GraphQL, and gRPC evidence because operation names match.
- The core is local, offline, and read-only. Use `weavatrix-refactor` only for
  an explicitly approved write plan and `weavatrix-online` only for explicitly
  approved network work.
