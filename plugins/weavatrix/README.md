# Weavatrix plugin

Weavatrix gives Cursor, Codex, Claude, and Grok Build 43 read-only repository
intelligence operations through one native MCP server. It covers source and
symbol search, dependency and call graphs, API and event-contract tracing,
change impact, architecture policy, Git history, duplicates, dead code,
coverage evidence, vector search, and temporal memory.

The plugin starts the published `weavatrix@1.9.0` npm package. That package
already contains the matching prebuilt native binaries; it has no lifecycle
scripts or runtime dependencies. The same release is also available as the
`weavatrix` crate on crates.io. Node.js 18 or newer is required for the plugin
launcher.

The bundled `weavatrix` skill is optional and activates only for repository
tasks that benefit from indexed, cross-file evidence. Its short entry point
explains when to use the MCP; the detailed tool map stays in a separate
reference and is loaded only when needed.

## Install

### Cursor

Search for **Weavatrix** in Cursor's Plugins view after the marketplace listing
is approved. For local testing, copy or link this directory to
`~/.cursor/plugins/local/weavatrix`, then reload the Cursor window.

### Codex

```text
codex plugin marketplace add sergii-ziborov/weavatrix --sparse .agents/plugins plugins/weavatrix
codex plugin add weavatrix@weavatrix
```

### Claude Code

```text
claude plugin marketplace add sergii-ziborov/weavatrix --sparse .claude-plugin plugins
claude plugin install weavatrix@weavatrix
```

### Grok Build

Grok reads Claude-compatible marketplaces automatically:

```text
grok plugin marketplace add sergii-ziborov/weavatrix
```

Open `/marketplace` and install Weavatrix. For direct testing without adding a
marketplace, use `grok plugin install sergii-ziborov/weavatrix#plugins/weavatrix`.

## Safety

Weavatrix is local, offline, and read-only. It reads repository files, Git
objects, coverage reports, and its derived graph state. It does not edit source
files or perform network vulnerability scans.

## Source and support

- Website: https://weavatrix.com
- Repository: https://github.com/sergii-ziborov/weavatrix
- Issues: https://github.com/sergii-ziborov/weavatrix/issues
