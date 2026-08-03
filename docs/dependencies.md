# Dependency boundary

The canonical product is intentionally an adapter, not a second copy of the
engine.

| Dependency | Layer | Purpose |
| --- | --- | --- |
| `weavatrix-rust` 2.x | repository adapter | protocol-independent graph, analysis, and 42 operations |
| `mcport` 0.3.x | inbound server | blocking modern/legacy MCP stdio and JSON-RPC shapes |
| `notify` 8.x | change-monitor adapter | recursive local filesystem invalidation |
| `blazingly-json` | ports/application | stable JSON value boundary without a second application model |

The product does not depend on Tokio, Hyper, Axum, a language server, a
network client, command-line Git, or ripgrep.

## Isolation rules

- only `mcp/server` uses `mcport` values;
- only `mcp/adapters/watcher` uses `notify`;
- only `mcp/adapters/repository` calls the engine;
- `mcp/application` depends on ports, not concrete adapters;
- the engine has no dependency back to this product.

## npm runtime

The published npm package has zero JavaScript dependencies. Its launcher uses
Node built-ins only to select and execute the bundled native binary.

There is:

- no `install`, `postinstall`, or preparation script;
- no runtime download;
- no scoped platform dependency that can disappear independently;
- no JavaScript relay in the MCP data path when `process.execve` is available.

`npm ls --all` on an installed package must have an empty runtime dependency
tree.

## Supply-chain gates

Release CI verifies:

- Cargo and npm product versions agree;
- `weavatrixEngineVersion` agrees with the resolved engine dependency;
- each platform artifact reports the expected product and engine identities;
- package contents contain only the launcher, skill, license, README, and six
  native binaries;
- `npm pack --dry-run` and installed-package checks pass;
- publication uses npm provenance;
- no registry token is written to the repository.

All maintained first-party Weavatrix crates and this product use the MIT
license.
