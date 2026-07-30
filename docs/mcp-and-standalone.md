# MCP product and standalone diagnostics

`weavatrix` is the MCP/npm product. `weavatrix-rust` is the reusable engine.
They share analysis and operation contracts but have different responsibilities.

Install the product from either registry:

```sh
npx -y weavatrix mcp .
cargo install weavatrix
weavatrix mcp .
```

## Product commands

```text
weavatrix mcp <repository> [--profile=all|code|seo]
weavatrix analyze <repository>
weavatrix list-tools [--profile=all|code|seo]
weavatrix tool <name> <repository> [json-arguments]
weavatrix --version
```

`mcp` is the agent-facing path. The remaining commands are diagnostics for
humans, CI, and release verification.

The compatibility binary alias `weavatrix-mcp` invokes the same native product.

## MCP protocol

The server uses ordered JSON-RPC over stdio and supports the modern and legacy
discovery shapes provided by `mcport`.

Behavioral guarantees:

- repository validation completes before handshake;
- stdout contains protocol output only;
- discovery and list-tools use the same profile-filtered catalog;
- unknown or profile-excluded operations return JSON-RPC `-32602`;
- default and `json` output include structured content;
- `text` output omits structured content;
- one request is completed before the next response is written.

There is no async runtime because ordered stdio has no multiplexed transport to
schedule.

## Refresh behavior

The application session owns refresh policy, not the protocol adapter:

- handshake and catalog inspection do not start the watcher;
- first operation refreshes before execution and then starts the watcher;
- queued changes are drained before later operations;
- changes arriving during catch-up receive a second drain/refresh pass;
- `open_repo` retargets the state and watcher;
- `rebuild_graph` performs the explicit rebuild path.

Watcher errors are returned as errors rather than converted into stale success.

## Profiles

Profiles are catalog views, not separate engines:

- `all`: all compiled operations;
- `code`: graph, source, impact, APIs, Git, health, and architecture;
- `seo`: content, graph, search, vector, semantic, and memory workflows.

Disabled compile-time capabilities are absent from catalog output. They are not
advertised as unavailable stubs.

## Standalone engine CLI

The `weavatrix-rust` crate installs a separate `weavatrix-rust` diagnostic
binary. It can analyze and call operations without MCP, a watcher, or npm:

```sh
cargo install weavatrix-rust
weavatrix-rust analyze .
weavatrix-rust list-tools .
weavatrix-rust tool verify_architecture .
```

Do not configure that binary as the MCP server. Agent integrations should run
the canonical `weavatrix` product from npm.
