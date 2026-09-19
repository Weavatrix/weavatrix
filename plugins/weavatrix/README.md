# Weavatrix plugin

<img src="assets/logo.svg" alt="Weavatrix logo" width="72" align="right">

Weavatrix gives Cursor, Codex, Claude, and Grok Build **64 read-only
operations** over one revision-bound graph. Ask it what breaks if a file
changes, who consumes an n8n field, whether an MCP schema still accepts
yesterday’s request, which viem sites follow an ABI layout change, or
whether `.weavatrix/architecture.json` still holds. It covers source and
symbol search, dependency and call graphs, API and event-contract tracing,
change impact, architecture policy, Git history, duplicates, dead code,
coverage evidence, vector search, temporal memory, exported n8n workflows
(`n8n_*`), Dify YAML apps (`dify_*`), Agent Plugins/Skills/MCP catalogs
(`agent_*`), Mermaid flowcharts (`diagram_*`), and Web3 ABI/consumer
impact (`web3_*`). See
[n8n](https://weavatrix.com/n8n) and [Dify](https://weavatrix.com/dify).

The plugin starts the published `weavatrix@1.16.3` npm package. That package
already contains the matching prebuilt native binaries; it has no lifecycle
scripts or runtime dependencies. The same release is also available as the
`weavatrix` crate on crates.io. Node.js 18 or newer is required for the plugin
launcher.

This directory is an **IDE marketplace bundle**, not a second product. It
does not ship an LSP (that is Serena), does not pack the repo into a prompt
(that is Repomix), and does not reimplement the engine. Its unique job is to
pin `${workspaceFolder}` so answers cannot drift to whatever directory the
host process happened to start in.

The bundled `weavatrix` skill is optional and activates only for repository
tasks that benefit from indexed, cross-file evidence. Its short entry point
explains when to use the MCP; the detailed tool map stays in a separate
reference and is loaded only when needed.

## Install

### Cursor

Search for **Weavatrix** in Cursor's Plugins view after the marketplace listing
is approved. For local testing, copy or link this directory to
`~/.cursor/plugins/local/weavatrix`, then reload the Cursor window.

Prefer the plugin MCP (or a User MCP that also uses `${workspaceFolder}`). Do
not keep a machine-wide `weavatrix mcp .` User MCP beside the plugin: one shared
process with a cwd root is what lets answers drift across repositories.

### Codex

```text
codex plugin marketplace add Weavatrix/weavatrix --sparse .agents/plugins plugins/weavatrix
codex plugin add weavatrix@weavatrix
```

### Claude Code

```text
claude plugin marketplace add Weavatrix/weavatrix --sparse .claude-plugin plugins
claude plugin install weavatrix@weavatrix
```

### Grok Build

Grok reads Claude-compatible marketplaces automatically:

```text
grok plugin marketplace add Weavatrix/weavatrix
```

Open `/marketplace` and install Weavatrix. For direct testing without adding a
marketplace, use `grok plugin install Weavatrix/weavatrix#plugins/weavatrix`.

## Safety

Weavatrix is local, offline, and read-only. It reads repository files, Git
objects, coverage reports, and its derived graph state. It does not edit source
files or perform network vulnerability scans.

## Source and support

- Website: https://weavatrix.com
- Repository: https://github.com/Weavatrix/weavatrix
- Issues: https://github.com/Weavatrix/weavatrix/issues
