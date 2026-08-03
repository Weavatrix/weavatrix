# Changelog

## 1.2.0 - 2026-08-03

- update the native MCP product to the published `weavatrix-rust` 2.1.1
  engine: 42 read-only operations;
- manifests saved with a UTF-8 BOM parse correctly in `build_graph` and the
  dependency audit, and standalone `go.mod` modules appear in `build_graph`;
- new tools: `map_stacktrace` (stack-trace text onto repository files and
  symbols), `select_tests` (static suite selection for a change), and
  `build_graph` (workspace, target, and runner topology from manifests);
- `token_budget` on `read_source`, `search_code`, `context_bundle`, and
  `query_graph` trims answers to an approximate token ceiling and reports
  the cut;
- dependency-injection wiring (Spring `@Autowired`, NestJS constructor
  injection) is graph evidence, so blast-radius and dead-code answers see
  controller-to-provider coupling;
- grounded health verdicts: `find_dead_code` honors `path`, tool
  configuration is not dead code, callbacks count as references, bare Node
  builtins and installed required peer dependencies are recognized,
  `change_impact` populates `impacted_nodes`, and unsupported `precision`
  is an explicit error instead of a silent downgrade;
- a quiet or coalesced file watcher no longer leaves the graph stale: the
  repository revision check runs on every tool call.

## 1.1.2 - 2026-07-30

- update the native MCP product to the published `weavatrix-rust` 2.0.2
  engine;
- keep every `find_duplicates` family internally consistent after
  test/classified/low-signal filtering and after `top_n` truncation: excluded
  members and dangling pair identifiers cannot survive, and the remaining
  pairs are rebuilt into deterministic connected components;
- make the distribution boundary explicit: `weavatrix` is the MCP product,
  while the separate engine diagnostic reports the unambiguous
  `weavatrix-rust` identity and is not an MCP server;
- pass the installed native npm identity gate and a bounded 1,000-call
  `graph_stats` load with zero failures and complete process-tree cleanup.

## 1.1.1 - 2026-07-30

- update the native MCP product to the `weavatrix-rust` 2.0.1 engine, whose
  self-audit recognizes Cargo sibling-library imports and whose production
  duplicate scan is clean at the 50-token / 92% gate;
- keep Cargo, npm, native binary, and MCP Registry identities synchronized and
  verify the installed package with a bounded 1,000-call load;
- make registry checks color-independent and create the immutable GitHub
  Release from the verified npm tag workflow.

## 1.1.0 - 2026-07-30

- establish `weavatrix` as the canonical native MCP product on both Cargo and
  npm, backed by the protocol-independent `weavatrix-rust` 2.0.0 engine;
- ship 39 read-only operations across 24 code and configuration surfaces as
  prebuilt Windows, macOS, and Linux binaries on x64 and arm64;
- document the product/engine boundary, architecture, full tool catalog,
  client setup, library use, evidence model, and bounded release benchmark;
- publish MIT-licensed packages with npm provenance and official MCP Registry
  metadata.

## 1.0.2 - 2026-07-30

- replace the minimal package copy with a product-first README covering all 39
  MCP tools, supported languages, evidence semantics, safety boundaries, client
  setup, library usage, and the verified native-versus-JavaScript benchmark;
- add dedicated getting-started, tool-reference, evidence-model,
  language-support, and MCP/standalone documentation;
- publish the full README as the docs.rs crate landing page and add explicit
  docs.rs package metadata;
- keep the native engine and npm wrapper release identities synchronized.

## 1.0.1 - 2026-07-30

- expose 39 read-only tools spanning graph, source, Git, cross-repository
  impact, Health, architecture, clones, search, vectors, semantic/SEO links,
  coverage, and temporal memory;
- replace lexical fallbacks with the lossless `weavatrix-parse` pipeline and
  add typed GraphQL, Protobuf/gRPC, JSON/JSONC, YAML/Kubernetes, Kafka,
  RabbitMQ/AMQP, NATS, SNS/SQS, and JMS evidence;
- resolve repository-relative Rust modules, re-exports, cross-file impl
  ownership, import aliases, call owners, test-only symbols, and production
  entry points before dead-code review;
- add cross-repository HTTP, GraphQL, gRPC, and event-contract tracing with
  concrete transport identities and source spans;
- integrate `mcport` 0.3.0 discovery, structured results, older MCP protocol
  compatibility, graph-first startup, bounded refresh, and filesystem
  watching;
- keep the library and CLI usable without MCP through
  `--no-default-features`, including Rust parsing through the lossless parser
  fallback;
- ship the native engine inside `weavatrix@1.0.0` as one zero-runtime-
  dependency package for Windows, macOS, and Linux on x64 and arm64;
- enforce installed-package identity, correctness, a 24x cold MCP speed gate,
  a 30x warm gate, npm provenance, crates.io verification, and immutable
  release evidence in CI.

## 0.2.0 - 2026-07-27

- compose scan, graph, Git, search, vector, clone, semantic, and memory crates;
- add one read-only stdio MCP with `all`, `code`, and `seo` profiles;
- cover the JavaScript read-only tool surface and add cross-repository Git,
  vector, semantic, SEO, and memory tools;
- add multi-language/domain extraction, measured coverage ingestion,
  incremental refresh, direct Git graph diff, and architecture checks;
- add same-revision JavaScript and component competitor benchmarks;
- recognize Axum, Actix, and Rocket-style Rust endpoints.

## 0.1.0 - 2026-07-22

- initial deterministic repository analyzer and graph snapshot.
