# Product architecture

Weavatrix is a thin native MCP product around the protocol-independent
`weavatrix-rust` engine. The split is intentional: protocol, process, and
filesystem-watcher concerns must not leak into repository analysis.

## Runtime boundary

```text
MCP client
    |
    | JSON-RPC over ordered stdio
    v
server adapter
    mcport values, discovery, list-tools, structured/text responses
    |
    v
application session
    active repository, profile, refresh lifecycle, watcher lifecycle
    |
    +-----------------------+
    |                       |
    v                       v
repository port         change-monitor port
    |                       |
    v                       v
weavatrix-rust adapter  notify adapter
    |
    v
weavatrix-rust operations
```

The adapter has four layers:

- `mcp/server`: inbound MCP framing and result conversion;
- `mcp/application`: the session use case and freshness policy;
- `mcp/ports`: repository and change-monitor contracts;
- `mcp/adapters`: `weavatrix-rust` and `notify` implementations.

`mcport` is visible only to the inbound server. `notify` is visible only to
its outbound adapter. The application layer receives typed port values, and
the engine receives neither MCP frames nor watcher events.

## Engine boundary

The engine owns:

- deterministic scanning and repository identity;
- lossless parsing and normalized source facts;
- graph construction and reference resolution;
- 42 read-only operations;
- Git, search, clone, vector, semantic, and memory composition;
- architecture and evidence semantics.

The product owns:

- the public `weavatrix` identity;
- profile-filtered tool discovery;
- MCP stdio compatibility;
- repository-session lifecycle;
- native filesystem watching;
- native npm packaging and platform selection.

The engine crate contains no MCP server, npm package, watcher, `mcport`, or
`notify` dependency.

## Session lifecycle

1. The requested repository is validated and opened before the MCP handshake.
2. `initialize`, discovery, and `tools/list` do not start a watcher.
3. The first operation performs an incremental freshness check, then starts
   the watcher even if the operation itself returns an error.
4. Later calls drain pending watcher events and refresh only when evidence may
   be stale.
5. `open_repo` replaces both the canonical repository state and watcher.
6. `rebuild_graph` explicitly rebuilds derived state.

Watcher events invalidate derived state; they never modify source.

## Profiles and catalog identity

The visible catalog comes from
`weavatrix_rust::operations::catalog_for_profile`. Discovery, list-tools, and
execution membership all use that same vector, so a hidden or uncompiled
capability cannot be advertised by one path and rejected by another.

- `all`: every compiled read-only operation;
- `code`: code, architecture, Git, graph, and quality workflows;
- `seo`: content, search, semantic, vector, and memory workflows.

## Evidence boundary

Every result belongs to one analyzed revision. Parsed spans, measured
coverage, resolved graph edges, inferred semantic links, and missing optional
evidence remain distinct states.

Dynamic dispatch that cannot be proved stays unresolved. A static reachability
result is not labelled measured coverage. Missing runtime evidence is
represented as absent evidence, not a fabricated clean result.

## Enforced modularity

The native adapter is intentionally small:

```text
src/main.rs
src/mcp/
  mod.rs
  error.rs
  ports/
  application/
  adapters/
  server/
```

Release gates enforce:

- no `foo.rs` plus `foo/` dual module forms;
- no file above 300 physical lines;
- no function above 100 physical lines;
- strict Clippy with warnings denied;
- protocol, refresh, profile, and identity tests.

The deeper engine applies the same budgets plus a zero-runtime-cycle
architecture contract.
