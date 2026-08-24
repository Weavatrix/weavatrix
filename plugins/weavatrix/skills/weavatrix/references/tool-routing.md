# Tool routing index

Open only the card for the method you are about to call. Each card explains
when to use the method, its exact published inputs, and a minimal compact call.
The live MCP `tools/list` schema is authoritative.

## Graph, source, and orientation

- [`graph_stats`](tools/graph_stats.md) — Graph size, evidence and build freshness.
- [`get_node`](tools/get_node.md) — Resolve one exact graph node.
- [`get_neighbors`](tools/get_neighbors.md) — Direct typed incoming and outgoing relationships.
- [`query_graph`](tools/query_graph.md) — Bounded BFS or DFS around exact or textual seeds.
- [`god_nodes`](tools/god_nodes.md) — Rank high-connectivity production nodes.
- [`shortest_path`](tools/shortest_path.md) — Shortest typed dependency path between two nodes.
- [`get_community`](tools/get_community.md) — Return one weak graph component.
- [`list_communities`](tools/list_communities.md) — List deterministic weak graph components.
- [`module_map`](tools/module_map.md) — Production folder and dependency map.
- [`build_graph`](tools/build_graph.md) — Workspace, target and runner topology from manifest evidence.
- [`search_code`](tools/search_code.md) — Literal or Rust-regex repository search without ripgrep.
- [`read_source`](tools/read_source.md) — Bounded source context by node or repository path.
- [`inspect_symbol`](tools/inspect_symbol.md) — Definition, direct relationships and source evidence.
- [`context_bundle`](tools/context_bundle.md) — Compact graph and source bundle for one symbol.
- [`map_stacktrace`](tools/map_stacktrace.md) — Map stack-trace text onto repository files and symbols.

## Change impact and Git

- [`get_dependents`](tools/get_dependents.md) — Bounded transitive reverse blast radius.
- [`change_impact`](tools/change_impact.md) — Read-only Git change impact with graph evidence.
- [`select_tests`](tools/select_tests.md) — Select the test suites a change most plausibly needs to run.
- [`git_history`](tools/git_history.md) — Bounded direct Git history without launching git.
- [`cross_repo_git`](tools/cross_repo_git.md) — Parallel histories, shared commits, or diffs across local repositories.
- [`verified_change`](tools/verified_change.md) — Composite pre-commit evidence and conservative verdict.
- [`graph_diff`](tools/graph_diff.md) — Compare the current snapshot with an immutable Git revision.

## Quality and architecture

- [`find_duplicates`](tools/find_duplicates.md) — Deterministic Type-1/2/3 clone families.
- [`find_dead_code`](tools/find_dead_code.md) — Conservative unreferenced-symbol review queue.
- [`run_audit`](tools/run_audit.md) — Repository structure and evidence completeness audit.
- [`coverage_map`](tools/coverage_map.md) — Measured coverage discovery or explicit static reachability.
- [`hot_path_review`](tools/hot_path_review.md) — Rank high-connectivity and large source symbols.
- [`get_architecture_contract`](tools/get_architecture_contract.md) — Read or preview the local target-architecture contract.
- [`prepare_change`](tools/prepare_change.md) — Select architecture rules for intended changed files.
- [`verify_architecture`](tools/verify_architecture.md) — Verify graph dependencies against the active contract.
- [`verify_capabilities`](tools/verify_capabilities.md) — Resolve declared capabilities against exposed endpoint evidence.
- [`explain_architecture_violation`](tools/explain_architecture_violation.md) — Explain one active contract violation.
- [`propose_architecture_exception`](tools/propose_architecture_exception.md) — Return a reviewable exception proposal without writing it.

## APIs and transports

- [`list_endpoints`](tools/list_endpoints.md) — Inventory statically extracted HTTP endpoints.
- [`trace_endpoint`](tools/trace_endpoint.md) — Resolve an endpoint and its bounded call neighborhood.
- [`trace_api_contract`](tools/trace_api_contract.md) — Cross-repository HTTP, GraphQL, gRPC and event-transport contract evidence.

## Repositories and refresh

- [`open_repo`](tools/open_repo.md) — Retarget to another local repository.
- [`list_known_repos`](tools/list_known_repos.md) — List repositories opened by this server process.
- [`rebuild_graph`](tools/rebuild_graph.md) — Rebuild the derived in-memory graph without source writes.

## Optional supplied-data analysis

- [`semantic_link`](tools/semantic_link.md) — Build inferred semantic graph evidence from supplied vectors.
- [`vector_search`](tools/vector_search.md) — Exact or bounded approximate nearest-neighbor search.
- [`seo_link_suggestions`](tools/seo_link_suggestions.md) — Directional SEO internal-link evidence from supplied page profiles.
- [`memory_context`](tools/memory_context.md) — Compile bounded temporal memory context from supplied events.
