# Tool routing index

Open only the card for the method you are about to call. Each card explains
when to use the method, its exact published inputs, and a minimal compact call.
The live MCP `tools/list` schema is authoritative. Every answer carries
`repository_context` (root, scan revision, Git HEAD, graph age). The process
pins its launch root and injects `expected_repository` when omitted, so answers
cannot silently switch to another repository. Pass an explicit
`expected_repository` to fail fast when you already know the intended folder.

## Graph, source, and orientation

- [`graph_stats`](tools/graph_stats.md) — Graph size, evidence and build freshness.
- [`get_node`](tools/get_node.md) — Resolve one exact graph node.
- [`get_neighbors`](tools/get_neighbors.md) — Direct typed incoming and outgoing relationships.
- [`query_graph`](tools/query_graph.md) — Bounded BFS or DFS around exact or textual seeds.
- [`god_nodes`](tools/god_nodes.md) — Rank high-connectivity production nodes.
- [`shortest_path`](tools/shortest_path.md) — Shortest typed dependency path between two nodes.
- [`get_community`](tools/get_community.md) — Return one coupling community (containment and package edges excluded).
- [`list_communities`](tools/list_communities.md) — List deterministic coupling communities (containment and package edges excluded).
- [`module_map`](tools/module_map.md) — Production folder map at a requested directory depth.
- [`build_graph`](tools/build_graph.md) — Workspace, target and runner topology from manifest evidence.
- [`search_code`](tools/search_code.md) — Literal or Rust-regex repository search without ripgrep.
- [`read_source`](tools/read_source.md) — Bounded source context by node or repository path.
- [`inspect_symbol`](tools/inspect_symbol.md) — Definition, direct relationships and source evidence.
- [`go_to_definition`](tools/go_to_definition.md) — Resolve the symbol at a source position to its definition without guessing by name.
- [`find_references`](tools/find_references.md) — Occurrences of the symbol at a position or label, from the graph and an on-disk SCIP index if present.
- [`context_bundle`](tools/context_bundle.md) — Compact graph and source bundle for one symbol.
- [`map_stacktrace`](tools/map_stacktrace.md) — Map stack-trace text onto repository files and symbols.

## Change impact and Git

- [`get_dependents`](tools/get_dependents.md) — Bounded transitive reverse blast radius.
- [`change_impact`](tools/change_impact.md) — Read-only Git change impact with graph evidence.
- [`select_tests`](tools/select_tests.md) — Select the test suites a change most plausibly needs to run.
- [`git_history`](tools/git_history.md) — Bounded direct Git history without launching git.
- [`git_read_blob`](tools/git_read_blob.md) — Bounded UTF-8 file content at an immutable Git revision or blob OID; binary blobs are refused.
- [`cross_repo_git`](tools/cross_repo_git.md) — Parallel histories, shared commits, or diffs across named local repositories.
- [`verified_change`](tools/verified_change.md) — Composite pre-commit evidence and conservative verdict.
- [`graph_diff`](tools/graph_diff.md) — Compare the current snapshot with an immutable Git revision.

## Quality and architecture

- [`find_duplicates`](tools/find_duplicates.md) — Deterministic Type-1/2/3 clone families.
- [`find_dead_code`](tools/find_dead_code.md) — Conservative unreferenced-symbol review queue.
- [`run_audit`](tools/run_audit.md) — Repository structure and evidence completeness audit.
- [`coverage_map`](tools/coverage_map.md) — Ingest a report Quality already built. Does not run tests. Missing report is unmeasured, not 0%.
- [`hot_path_review`](tools/hot_path_review.md) — Rank functions by static complexity times resolved call fan-in.
- [`perf_attribution`](tools/perf_attribution.md) — Correlate a measurement series with the declarations that changed between the revisions that produced it.
- [`get_architecture_contract`](tools/get_architecture_contract.md) — Read or preview the local target-architecture contract.
- [`prepare_change`](tools/prepare_change.md) — Select architecture rules for intended changed files.
- [`verify_architecture`](tools/verify_architecture.md) — Verify graph dependencies against the active contract.
- [`verify_capabilities`](tools/verify_capabilities.md) — Resolve declared capabilities against exposed endpoint evidence.
- [`explain_architecture_violation`](tools/explain_architecture_violation.md) — Explain one active contract violation.
- [`propose_architecture_exception`](tools/propose_architecture_exception.md) — Return a reviewable exception proposal without writing it.

## APIs and transports

- [`list_endpoints`](tools/list_endpoints.md) — Inventory statically extracted HTTP endpoints, including hand-rolled req.method/pathname conditions.
- [`trace_endpoint`](tools/trace_endpoint.md) — Resolve an endpoint and its bounded call neighborhood.
- [`trace_api_contract`](tools/trace_api_contract.md) — Cross-repository HTTP, GraphQL, gRPC and event-transport contract evidence for named backend and client roots.

## Repositories and refresh

- [`open_repo`](tools/open_repo.md) — Retarget to another local repository. Default launches refuse this unless started with `--allow-retarget`. Graphs unused for 20 minutes unload; asking for one again rescans that folder.
- [`list_known_repos`](tools/list_known_repos.md) — List repositories with an in-process graph.
- [`rebuild_graph`](tools/rebuild_graph.md) — Rebuild the derived in-memory graph without source writes.

## Optional supplied-data analysis

- [`semantic_link`](tools/semantic_link.md) — Build inferred semantic graph evidence from supplied vectors.
- [`vector_search`](tools/vector_search.md) — Exact or bounded approximate nearest-neighbor search.
- [`seo_link_suggestions`](tools/seo_link_suggestions.md) — Directional SEO internal-link evidence from supplied page profiles.
- [`memory_context`](tools/memory_context.md) — Compile bounded temporal memory context from supplied events.

## n8n workflows

- [`n8n_inventory`](tools/n8n_inventory.md) — List exported workflows, nodes, entries, and coverage.
- [`n8n_trace`](tools/n8n_trace.md) — Bounded flow, output-dependency, error, and subworkflow walk.
- [`n8n_context`](tools/n8n_context.md) — Bounded context for one node or workflow, without secrets.

## Dify apps

Local YAML export only. Not the Dify console API. Shipped in product 1.13.0
on engine `weavatrix-rust` 2.13.2. See [weavatrix.com/dify](https://weavatrix.com/dify).

- [`dify_inventory`](tools/dify_inventory.md) — List exported apps, nodes, modes, and coverage.
- [`dify_trace`](tools/dify_trace.md) — Bounded control and data walk, including iteration scope.
- [`dify_context`](tools/dify_context.md) — Bounded context for one node or app, without secrets.

## Agent packages

Local plugin, skill, catalog, and observation files only. Not a plugin
runtime, gateway, or policy authority. Requires engine `weavatrix-rust`
2.14.3.

- [`agent_inventory`](tools/agent_inventory.md) — List plugins, skills, MCP bindings, catalog tools, and supplied observations.
- [`agent_trace`](tools/agent_trace.md) — Declared origin, profile, transport, and package bindings for one identity.
- [`agent_context`](tools/agent_context.md) — Bounded context; `allowed-tools` is not a grant.
- [`agent_change_impact`](tools/agent_change_impact.md) — Compare two catalog snapshots; a known inject transform can keep one exposure compatible.

## Mermaid diagrams

Local flowchart files and Markdown fences only. Not a renderer. Requires
engine `weavatrix-rust` 2.14.3.

- [`diagram_inventory`](tools/diagram_inventory.md) — List diagrams, native elements, and explicit sidecar bindings.
- [`diagram_trace`](tools/diagram_trace.md) — Walk `declared_architecture` arrows only.
- [`diagram_context`](tools/diagram_context.md) — Fragments and binding status; display names are not IDs.

## Web3 integration

Local ABI JSON, supplied solc/Foundry artifacts, and static viem/wagmi
sources only. Not a compiler, RPC client, or wallet. Requires engine
`weavatrix-rust` 2.16.3.

- [`web3_inventory`](tools/web3_inventory.md) — List ABIs, artifacts, and static consumers.
- [`web3_trace`](tools/web3_trace.md) — Walk proven ABI, artifact, and consumer bindings.
- [`web3_impact`](tools/web3_impact.md) — Interface deltas and consumer-specific effects, including silent event misdecode.
- [`web3_context`](tools/web3_context.md) — Bounded fragments plus explicit deployment gaps.
