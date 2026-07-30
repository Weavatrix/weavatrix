# Evidence model

Weavatrix distinguishes discovered facts from inference and inference from a
guess. Provenance is stored as data rather than flattened into an unqualified
edge.

## Identity

Every analysis is tied to a canonical repository root and verified revision.
Cross-repository operations preserve the identity of every participating root.
Session refresh replaces a snapshot atomically rather than mixing revisions.

## Nodes and edges

Nodes represent repositories, files, symbols, endpoints, contracts,
infrastructure objects, and configuration. Edges represent containment,
imports, references, calls, inheritance, re-exports, route handling, transport
production/consumption, or inferred semantic links.

An edge can carry:

- extractor identity;
- evidence kind;
- confidence;
- exact source span;
- relationship-specific metadata;
- repository and revision provenance.

## Deterministic and inferred evidence

Parser, manifest, Git, route, and measured-coverage facts are deterministic.
Vector, semantic, and SEO relationships remain inferred with model, score,
selection policy, and direction.

Inferred content edges are never inserted into the deterministic code graph as
if a compiler or parser proved them.

## Ambiguity

The resolver prefers no relationship over a confident wrong target. Dynamic
JavaScript or Python evidence can retain receiver, import, candidate context,
and source span without selecting an unrelated same-named symbol.

Operation results use explicit states such as complete, absent, ambiguous,
truncated, or error. `UNKNOWN` is not a fallback result.

## Coverage

`coverage_map` ingests measured LCOV, Istanbul, Tarpaulin JSON, and LLVM
coverage. Static reachability may identify likely affected tests but is never
labelled measured coverage.

Artifact absence cannot become a zero-risk or fully-covered conclusion.

## Architecture evidence

An architecture violation contains:

- the rule and direction that failed;
- exact source and target components;
- the typed dependency edge;
- file and source span provenance when available;
- a stable fingerprint for comparison.

Exceptions are explicit contract data. A strict contract can require an empty
exception list and empty baseline so every violation blocks the release.

## Bounded correctness

Large graphs use filters, limits, compact/full detail, and deterministic
cursors. Pagination bounds context without pretending omitted evidence does
not exist.

If a bound prevents the declared evaluation from completing, the operation
returns an explicit truncation or error according to its contract.

Duplicate families obey the same invariant. Filtering tests, classified paths,
or low-signal pairs and applying `top_n` first reduce the accepted pair set;
families are then rebuilt from those surviving pairs. A returned family cannot
name an excluded member or a pair outside its deterministic connected
component.

## Reproducibility

Benchmark and parity artifacts retain versions, corpus revisions, normalized
identities, samples, timings, invariants, and SHA-256 digests. Release claims
point to these artifacts rather than prose numbers alone.
