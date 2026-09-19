# `coverage_map`

Ingest a measured coverage report and hang it on graph nodes. This is not a
test runner.

## Do not get lost

| Product | Job |
| --- | --- |
| Weavatrix Quality (`quality_run` / `wvq run`) | **Build** the report with the project's own frozen runner and write `.weavatrix/coverage/lcov.info`. |
| Weavatrix `coverage_map` | **Ingest** a report that already exists. Never spawn `cargo test`, Vitest, Jest, Bun, Go, or Playwright. |

Call Quality first when you need measured numbers. Then call `coverage_map`.
Calling `coverage_map` alone on a repository that has no report is a successful
empty ingest: `measured_coverage.present = false`, plus separately labeled
static reachability. That is not 0% and not 100%.

Cortex Loom "coverage certificates" are packet facts. They are not line
coverage and they do not feed this tool.

## Search paths (first file wins)

1. `lcov.info`
2. `coverage/lcov.info`
3. `.weavatrix/coverage/lcov.info` — the path Quality publishes
4. `tarpaulin-report.json`
5. `target/tarpaulin/tarpaulin-report.json`
6. `target/llvm-cov/coverage.json`
7. `coverage/coverage-final.json`

## Arguments

- `path` — substring filter on report file paths
- `top_n` — cap the returned file list

## How to read the reply

- `measured_coverage.present = true` — a report was parsed. `report` is the
  repository-relative path. `source` states that Weavatrix did not execute
  tests.
- `measured_coverage.present = false` — none of the search paths existed.
  `files` is empty. `static_reachability` may still list likely tests. The
  `warning` field repeats that this is not measured coverage.
- `status: COMPLETE` with `present = false` is not a green coverage gate.

## Quality builds the report

Weavatrix Quality does not invent a second test stack. Discovery uses what
the repository already has:

- Rust: `cargo llvm-cov` when that Cargo subcommand exists (skipped on
  `windows-gnu`, which lacks `profiler_builtins`), else `cargo tarpaulin`,
  else plain `cargo test` (no measured report).
- JavaScript/TypeScript: Vitest with an already-declared coverage provider,
  else Jest `--coverage`, else Bun `--coverage`. Playwright is used only
  when no other JS runner owns the package.
- Go: the registered `go-test` coverprofile is normalized and then published
  as LCOV on the Weavatrix search path.

Policy bindings may still say `cargo-test`. Discovery may upgrade the spawn
to `cargo-llvm-cov` or `cargo-tarpaulin`. Mutation stays on `cargo-test` so
each mutant is not measured as if it were a coverage run.

## Agent sequence

1. `quality_run` (or `wvq run`) on the same repository, **or** place one of
   the files above yourself.
2. `coverage_map` (optionally `path` / `top_n`).
3. Treat `present = false` as "unmeasured", not as "uncovered" or "safe".
