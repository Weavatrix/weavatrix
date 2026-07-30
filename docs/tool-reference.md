# Operation reference

The full native product exposes 39 bounded read-only MCP operations. JSON
schemas returned by `tools/list` are the authoritative machine contract.

## Graph and orientation

- `graph_stats`: root, revision, freshness, graph counts, and capabilities.
- `get_node`: one exact file, symbol, endpoint, or graph node.
- `get_neighbors`: typed direct inbound or outbound relationships.
- `query_graph`: bounded BFS/DFS around exact file or symbol seeds.
- `god_nodes`: high-connectivity nodes for architecture review.
- `shortest_path`: one bounded typed path between exact nodes.
- `get_community`: one deterministic graph community.
- `list_communities`: bounded community inventory.
- `module_map`: repository territories and their relationships.

## Change impact and proof

- `get_dependents`: bounded reverse blast radius.
- `change_impact`: Git changes mapped onto graph evidence.
- `verified_change`: impact, architecture, duplicate, API, and optional test
  evidence for planning or verification.
- `prepare_change`: relevant context and architecture rules before editing.
- `graph_diff`: typed structural difference between revisions.

## Exact source context

- `search_code`: bounded literal or regex repository search.
- `read_source`: verified source excerpt with exact lines.
- `inspect_symbol`: declaration, owner, inbound, and outbound evidence.
- `context_bundle`: ranked minimal task workset around a target.

## Health and quality

- `find_duplicates`: Type-1/2/3 clone families with boilerplate controls.
- `find_dead_code`: review candidates with entry-point, test, configuration,
  dynamic, and external-use classification.
- `run_audit`: dependency, runtime, graph, and capability health.
- `coverage_map`: measured coverage attached to graph nodes.
- `hot_path_review`: high-connectivity and high-change review targets.

These operations do not delete code or convert a missing artifact into a clean
result.

## APIs and transports

- `list_endpoints`: bounded HTTP endpoint inventory.
- `trace_endpoint`: one route neighborhood and related callers.
- `trace_api_contract`: cross-repository HTTP, GraphQL, gRPC, Kafka,
  RabbitMQ/AMQP, JMS, NATS, SQS, and SNS evidence.

## Architecture

- `get_architecture_contract`: read and validate local architecture policy.
- `verify_architecture`: dependency, cycle, file, and function budget checks.
- `explain_architecture_violation`: bounded evidence for one fingerprint.
- `propose_architecture_exception`: reviewable exception proposal without a
  filesystem write.

## Git and repositories

- `git_history`: bounded history, churn, and co-change without spawning Git.
- `cross_repo_git`: histories, shared commits, or diffs across local roots.
- `open_repo`: switch the process-local active repository.
- `list_known_repos`: repositories opened by this process.
- `rebuild_graph`: explicit full derived-state rebuild.

## Native extensions

- `vector_search`: exact or bounded approximate nearest-neighbor search.
- `semantic_link`: inferred links with model and score provenance.
- `seo_link_suggestions`: directional internal-link evidence.
- `memory_context`: bounded temporal context from supplied events.

Vectors and events are supplied by the caller. Weavatrix does not call an
embedding service or model.

## Common arguments and results

Operation-specific schemas define exact arguments. Common controls include:

- repository or target identity;
- production/test visibility;
- detail level;
- item, file, byte, history, and traversal limits;
- deterministic cursor pagination;
- text or structured output selection at the MCP boundary.

Repository-state operations execute against an identified root and revision.
Cross-repository or cross-revision results label each boundary explicitly.
Large collections expose totals, `has_more`, and `next_cursor`.

Evidence records carry extractor, evidence class, confidence, and optional
source span. Ambiguous short names are rejected instead of attached to a
guessed target.

## Catalog inspection

```sh
npx -y weavatrix list-tools --profile=all
npx -y weavatrix list-tools --profile=code
npx -y weavatrix list-tools --profile=seo
```

Profile-excluded and uncompiled capabilities are absent from the catalog and
return `unknown tool` if called.
