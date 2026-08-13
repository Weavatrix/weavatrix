# Changelog

## 1.8.0 - 2026-08-12

Engine `weavatrix-rust` 2.6.0.

- The filesystem watcher no longer grows without bound while the server is
  idle. Events were queued raw on an unbounded channel and only classified
  when a tool call drained it, so a build writing into `target/` charged
  roughly a kilobyte per event to a server nobody was calling - measured at
  13.7 GB per process before the change. Events are now classified in the
  notify callback and collapse into a single pending-change flag, which is
  all `changed()` ever reported; watching is constant-memory regardless of
  event volume. Derived-directory churn was already ignored, but only after
  it had been paid for.

- MCP package surface is gated at >=95% line coverage via
  `scripts/check-mcp-coverage.ps1` (`cargo llvm-cov` on `src/mcp`, excluding
  the stdio entrypoint and the engine crate).

- The architecture contract grows into a policy engine. `forbid` rules
  accept `reachability: "transitive"` and prove each violation with a
  deterministic shortest path; `require` demands that every selected source
  reach a target component; `allow_only` closes a component's dependency
  list; and the synthetic `unresolved` kind turns unresolvable local imports
  into rule violations.

- Dependency rules select files by path, the Dependency-Cruiser way.
  `fromPath` and `toPath` regular-expression selectors join component
  addressing, `fromPathNot`/`toPathNot` exclude what the positive selector
  caught, and `toPath` may reference `fromPath` capture groups as
  `$1`..`$9`: `fromPath: "^src/([^/]+)/ui/"` with `toPath: "^src/$1/db/"`
  keeps a feature's UI inside that same feature's data layer. Patterns are
  a declared regex subset; shorthand classes, backreferences, counted
  quantifiers, and lookarounds reject the contract instead of silently
  selecting nothing.

- Rules carry `severity`. `error`, the default, blocks; `warn` reports the
  violation in the new `warnings` array of `verify_architecture` without
  changing the state, so a rule can be staged before it is enforced.

- Unknown dependency-rule fields are rejected. A misspelled selector used
  to be a rule that matched nothing and verified as passing; it now names
  the field and fails closed.

- `weavatrix tool verify_architecture` and `verify_capabilities` exit
  non-zero when the verification is BLOCKED, so a CI step gates on the
  exit code without parsing JSON. The report stays on stdout.

- Rust graph truth: a module declared with `#[path]` resolves as local
  source instead of an external package, a function passed as a value -
  `iter.and_then(validate)` - keeps its reference evidence, and
  `Type::method()` receivers reference their type.

## 1.7.1 - 2026-08-12

Engine `weavatrix-rust` 2.5.1.

- Rust calls written inside the standard formatting macros are call evidence
  again. The engine did not look into macro token streams, so a helper invoked
  only as `println!("{}", helper(value))` reported no callers and could
  surface as dead code. The argument lists of `format!`, `print!`, `println!`,
  `eprint!`, `eprintln!`, `write!`, `writeln!`, `dbg!`, and the `format_args!`
  pair are now traversed as ordinary expressions. Other macros stay untouched:
  their tokens may be declarations, patterns, or prose, and guessing would
  turn speculation into graph evidence.

- Python calls inside f-strings keep their call edges through the published
  `weavatrix-parse` 0.3.1, so `f"{load(path)}"` is incoming evidence for
  `load` the same way an ordinary call is.

## 1.7.0 - 2026-08-11

Engine `weavatrix-rust` 2.5.0.

- `git_history` returns the requested commits without paying for hotspot and
  co-change analysis by default. `include_analytics: true` keeps the richer
  report available when a caller needs it.

- `graph_diff` rolls edge churn up to file-pair and relation counts by default,
  so a localized revision does not expand into thousands of near-identical
  symbol-edge records. `detail: "edges"` preserves the raw evidence opt-in,
  and both modes honor `token_budget`.

- Rust symbol reads now keep the full named definition for structs, enums,
  traits, impls, and functions instead of stopping at the declaration name.
  Context packages therefore include the fields and bodies needed to perform
  an implementation task.

- Rust types used in signatures and fields create reference evidence for
  unqualified repository types. Qualified paths remain fail-closed so a path
  such as `std::io::Result` cannot bind to an unrelated local `Result`.

## 1.6.0 - 2026-08-10

- `--output-format=json|text|structured` and `WEAVATRIX_OUTPUT_FORMAT` choose
  the answer shape once at startup. 1.5.0 could drop the text mirror, but only
  per call, so an agent had to restate the choice on every one of the 43
  operations and pay argument tokens to save payload tokens. Whether a client
  reads `structuredContent` does not change between calls, so the operator
  decides it once and no call carries the argument. A call that names its own
  `output_format` still wins, the flag wins over the environment, and `json`
  remains the default because a client that ignores `structuredContent` would
  otherwise see an empty result. Measured on `run_audit` over a real
  repository with no call arguments at all: 8931 bytes by default, 3589 with
  the flag.

- a server started with a non-default answer shape says so once on stderr.
  stdout carries the protocol, so that is the only channel where an operator
  can be told which shape the process produces without corrupting the stream.

## 1.5.0 - 2026-08-10

Engine `weavatrix-rust` 2.4.0 on `mcport` 0.5.0.

- `output_format: "structured"` answers with `structuredContent` and no text
  mirror. An MCP result carries the payload twice, and the mirror is the
  pretty-printed copy, so it is the larger of the two. Measured through this
  server on `run_audit` over a real repository the response fell from 8931 to
  3589 bytes, 59.8% smaller. The default is unchanged: a client that ignores
  `structuredContent` would see an empty result, so dropping the mirror stays
  the caller's decision.

- Rust route attributes are read past their first argument, so a repository
  that records operation identity beside the path no longer reports zero
  endpoints. `blazingly` at 873db4a went from 0 endpoint nodes to 78. An axum
  `MethodRouter` chain also exposes every verb it serves.

- `verify_capabilities` resolves a declared served surface against the
  endpoints a revision exposes, and reports both directions: a claim with no
  evidence behind it, and an exposed endpoint no claim covers.

- the README title and the product-boundary diagram no longer carry
  double-encoded characters. The published 1.4.0 page rendered its em dash as
  a three-character mojibake sequence; npm serves the README from the
  published tarball, so only a new version could replace it.

## 1.4.0 - 2026-08-09

Engine `weavatrix-rust` 2.3.0.

- `run_audit` and `graph_stats` return the capability matrix only when asked
  for it with `include_capabilities`. The matrix is static: the same list for
  every repository and every call, and the largest single block of both
  answers — 56% of `run_audit` and 87% of `graph_stats` on a 66-file
  repository. Callers paid for it on every call to learn nothing about the
  repository they had asked about. Measured on that repository the default
  answers drop from 2872 to 1379 and from 1748 to 252 estimated tokens; a
  caller that passes the argument gets exactly what it got before.
  `rebuild_graph` and `open_repo` forward their arguments, so the graph blocks
  they nest shed the matrix too.

## 1.3.1 - 2026-08-05

Engine `weavatrix-rust` 2.2.1.

- an operation that cannot apply `token_budget` answers and records that in
  the response instead of refusing the call. 1.3.0 shipped the argument as an
  error, which withheld evidence a read-only operation had already produced
  and broke every caller that passes the budget uniformly. The budget block
  now appears on every operation that was given one, carrying `applied: false`,
  `dropped_items: 0`, and the estimated cost beside the same `fit` field the
  applying operations report, so a caller reads one shape everywhere and no
  evidence is lost;
- `server.json` ships without a byte-order mark again, so the MCP Registry
  publisher reads it: the 1.3.0 tag published to npm and then failed there.

## 1.3.0 - 2026-08-05

Engine `weavatrix-rust` 2.2.0: three reports that claimed more than their
evidence supported now hold up to a hand check, and `find_duplicates` gains
the string-payload pass its schema already advertised.

- `find_duplicates` reports only the lines a clone covers completely, and
  carries the matching `start_byte`/`end_byte`. A token window starts and ends
  mid-line, so the reported first and last line used to include text the
  matcher never compared: a `strict_equal` pair could be diffed line by line
  and come out different - the reading that collapses two distinct cases into
  one;
- `find_duplicates` implements `include_strings`. A string literal is one
  token to the code pass however much it carries, so a duplicated inline SQL
  statement, embedded template, or provisioning script never reached
  `min_tokens` and stayed invisible; the opt-in compares the payloads
  themselves;
- `run_audit` runtime findings land on the line they matched. Blanking string
  literals and comments consumed their line breaks too, so every finding after
  a multi-line literal shifted onto an earlier line;
- `token_budget` is refused by the operations that cannot apply it. Four
  operations trim their answer and account for what they dropped; every other
  operation used to accept the argument in silence and answer unbounded,
  spending the context window the caller set it to protect.

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
