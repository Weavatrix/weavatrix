# Native npm distribution

`weavatrix` ships one universal npm package containing six native binaries and
a zero-dependency Node launcher.

## Package layout

```text
weavatrix/
  package.json
  README.md
  LICENSE
  skill/
  bin/
    weavatrix.mjs
    weavatrix-mcp.mjs
    resolve-binary.mjs
    run-native.mjs
    native/
      win32-x64/weavatrix.exe
      win32-arm64/weavatrix.exe
      darwin-x64/weavatrix
      darwin-arm64/weavatrix
      linux-x64/weavatrix
      linux-arm64/weavatrix
```

The launcher selects exactly one bundled artifact from platform and
architecture. Unsupported combinations fail with an explicit error.

## No install-time execution

The manifest has no lifecycle scripts. All native artifacts are present in the
published tarball, so installation performs no download, compilation, platform
package resolution, or executable code.

The launcher uses Node built-ins only. On platforms where `process.execve` is
available it replaces itself with the native process; otherwise it uses one
`stdio: inherit` child. It never parses, relays, or buffers MCP messages.

## Version identities

Two versions are intentionally visible:

- npm/product version: `weavatrix` 1.1.2;
- engine version: `weavatrix-rust` 2.0.2.

The native binary reports both:

```text
weavatrix 1.1.2 (engine 2.0.2)
```

`package.json` stores the engine identity in `weavatrixEngineVersion`. Release
CI compares it with Cargo metadata and every built binary.

The protocol-independent engine has its own diagnostic binary. Its
`--version` output starts with `weavatrix-rust`, not `weavatrix`, so logs and
support reports cannot confuse the standalone engine with this MCP product.

## Build matrix

| npm platform | Rust target |
| --- | --- |
| `win32-x64` | `x86_64-pc-windows-msvc` |
| `win32-arm64` | `aarch64-pc-windows-msvc` |
| `darwin-x64` | `x86_64-apple-darwin` |
| `darwin-arm64` | `aarch64-apple-darwin` |
| `linux-x64` | `x86_64-unknown-linux-gnu` |
| `linux-arm64` | `aarch64-unknown-linux-gnu` |

Each matrix job builds the canonical adapter against the published engine and
uploads one immutable artifact. The packaging job downloads all six, verifies
their identities and hashes, assembles one tarball, and runs installed-package
tests.

## Publication gates

Before `npm publish --provenance`, CI requires:

- Rust format, Clippy, and tests;
- platform artifact identity;
- exact package contents;
- `npm pack --dry-run`;
- installation into a clean npm root;
- zero runtime dependencies and zero lifecycle scripts;
- successful MCP initialize, discovery, list-tools, and representative calls;
- installed-boundary cold and warm performance thresholds;
- process-tree cleanup.

A successful build or push is not a release claim. The workflow verifies that
the immutable version becomes visible from the npm registry after publication.

## Local preparation

After building the native binary:

```sh
node scripts/build-npm-packages.mjs current <platform-key> <path-to-binary>
npm pack --dry-run ./npm/dist/weavatrix
```

Use one of the platform keys from the build matrix above. The source
`npm/weavatrix` directory is only the launcher template; it intentionally does
not contain copied legal/registry/skill assets or native binaries and is never
the publish target.

Publishing is performed only by the protected workflow. Do not store
`NPM_TOKEN` in a file, manifest, log, or committed environment configuration.
