# `architecture_inventory`

Observed package, nested component, declared-membership, typed edge, and
architecture-style evidence. The default is a bounded overview, not a raw
graph dump. Style findings are independent hypotheses, never the target
contract's declared style.

## When to use

Orient in an unfamiliar repository or compare observed structure with a
separately declared architecture contract.

Component identities distinguish paths that sanitize alike, including the
repository root. Files can retain every matching declared membership. Edge
totals and component SCC/cycle witnesses are computed before presentation
limits, and each recovered fact keeps its immutable source evidence. A cycle in
the component quotient is reported as architecture, not as symbol recursion.

## Inputs

- `detail`: `summary` (default) or `full`.
- `max_results` (1–500) and `edge_cursor`: page edges in `full` mode. Supplying
  either without `detail` implies `full`; neither shrinks the summary.
- `token_budget`: additional output ceiling; may drop samples or evidence.
- `output_format` (`text`, `json`, or `structured`) changes only the MCP
  representation. `text` still contains serialized JSON, not prose.
- `expected_repository` (optional active-root guard).

## Minimal call

```json
{"name":"architecture_inventory","arguments":{}}
```

Read `architecture_hypotheses.hypotheses` first. `modular_source` concerns
source organization; `onion` and `layered` concern dependency direction;
`ports_and_adapters` concerns core interfaces and adapters; `microservices`
concerns deployment and remains unconfirmed without independent deployment
evidence. These dimensions may coexist. `SUPPORTED` means the rule's static
signals were observed, not that architectural intent or runtime behavior was
proven. `CANDIDATE` requires qualified language, `CONTRADICTED` needs its
counterexample, and `INSUFFICIENT_EVIDENCE` must not be turned into absence.
Path names are weak role candidates; inspect `observed_signals`,
`contradictions`, and `unknowns`. Never use a contract `style`, green
`verify_architecture` result, or package count as proof of an observed style.

Answer in your own concise prose, for example: "Modular source organization:
supported (module markers and cross-directory imports). Onion: insufficient
evidence (no application-to-domain and outer-to-core chain)." Include one
decisive file-level witness when available, not the entire JSON. Never
present a quotient/union cycle candidate as a proven executable cycle. Ask
for `{"detail":"full"}` only to inspect a specific edge, component, or
cycle witness. The full response can be large and paginates edges.

The live MCP `tools/list` schema is authoritative.
