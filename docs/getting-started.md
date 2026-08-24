# Getting started

## Requirements

- Node.js 18 or newer for the zero-dependency launcher;
- a supported Windows, macOS, or glibc Linux x64/arm64 platform;
- a local repository the MCP process can read.

No Rust toolchain is required for the npm package.

## Install

Use the prebuilt npm distribution:

```sh
npx -y weavatrix mcp .
```

Or build and install the same product from crates.io:

```sh
cargo install weavatrix
weavatrix mcp .
```

## Run once

Use an explicit path when the MCP client starts outside the repository:

```sh
npx -y weavatrix mcp C:/work/my-project
```

Profiles reduce the advertised surface:

```sh
npx -y weavatrix mcp . --profile=all
npx -y weavatrix mcp . --profile=code
npx -y weavatrix mcp . --profile=seo
```

## Configure Codex

```toml
[mcp_servers.weavatrix]
command = "npx"
args = ["-y", "weavatrix", "mcp", "C:/work/my-project", "--profile=code"]
```

Restart the client after changing its MCP configuration.

## Configure Claude Code

```sh
claude mcp add weavatrix -- \
  npx -y weavatrix mcp C:/work/my-project --profile=code
```

## Configure Grok

```sh
grok mcp add weavatrix -- \
  npx -y weavatrix mcp C:/work/my-project --profile=code
```

Grok parses its own flags before `--` and passes everything after it to the
server, which is what keeps `-y` attached to `npx`. The written form:

```toml
# ~/.grok/config.toml
[mcp_servers.weavatrix]
command = "npx"
args = ["-y", "weavatrix", "mcp", "C:/work/my-project", "--profile=code"]
startup_timeout_sec = 120
```

The npm package unpacks to roughly 40 MB. A first `npx` launch downloads it
before answering the MCP handshake, which can outlast Grok's 30-second default
startup timeout, so raise it for that run. Installing the launcher once with
`npm i -g weavatrix` or `cargo install weavatrix` avoids the cold start and
lets `command = "weavatrix"` replace the `npx` wrapper.

`grok mcp add --scope project` writes `.grok/config.toml` in the current
directory instead of the home config, so a repository can ship the server to
every machine that clones it. Verify either scope with:

```sh
grok mcp list
grok mcp doctor weavatrix
```

Grok also reads Claude and Cursor MCP configuration, so a machine that already
has one of those entries needs no second copy.

## Configure Cursor

```json
{
  "mcpServers": {
    "weavatrix": {
      "command": "npx",
      "args": ["-y", "weavatrix", "mcp", "C:/work/my-project", "--profile=code"]
    }
  }
}
```

Cursor reads `~/.cursor/mcp.json` for every project and
`<project>/.cursor/mcp.json` for one. Weavatrix is not published to any editor
plugin marketplace, so this file is the supported way to add it.

## Any other client

Weavatrix is published to the official MCP registry as
`io.github.weavatrix/weavatrix`. A client that installs from the registry
resolves the same npm package and stdio launch used above, so it needs no
hand-written entry:

```sh
curl "https://registry.modelcontextprotocol.io/v0/servers?search=weavatrix&version=latest"
```

Any client that accepts a raw stdio command takes `npx -y weavatrix mcp .`
directly. Nothing in the launcher is client-specific.

## Verify the native product

```sh
npx -y weavatrix --version
npx -y weavatrix list-tools --profile=code
npx -y weavatrix analyze .
```

Version output reports both identities:

```text
weavatrix 1.3.1 (engine 2.2.1)
```

`analyze` is a diagnostic command. Agent integrations should use `mcp`.

## First useful prompts

```text
Summarize the repository graph and identify its largest communities.
Trace this endpoint from server declaration to all known clients.
Show the bounded impact of changing this symbol.
Verify .weavatrix/architecture.json and explain each new violation.
Find production dead code, excluding tests and generated evidence.
Build a minimal context bundle for this change.
```

## Architecture contracts

Create `.weavatrix/architecture.json` in the analyzed repository, then call
`verify_architecture`. A strict contract can define:

- named components and their paths;
- forbidden dependency directions;
- zero runtime cycles;
- maximum file and function sizes;
- no exceptions and an empty baseline.

Use `explain_architecture_violation` for evidence. An exception proposal is
only a structured suggestion; Weavatrix does not write the contract.

## Freshness

The initial repository is opened before handshake. The first operation performs
an incremental catch-up and starts the native watcher. Later calls refresh only
after relevant filesystem changes.

Use `rebuild_graph` when you explicitly want a full rebuild. Use `open_repo`
to switch the active session to another repository.

## Troubleshooting

- `unknown tool`: the operation is outside the selected profile or was not
  compiled into this product.
- repository open error: pass an existing readable directory.
- no measured coverage: provide a supported coverage artifact; static
  reachability is intentionally not substituted.
- stale client catalog: restart the MCP client after changing profiles or
  product versions.

For Rust embedding, use the protocol-independent
[`weavatrix-rust`](https://docs.rs/weavatrix-rust) crate. Installing that crate
does not install an MCP server.
