---
name: weavatrix
description: >-
  Use the Weavatrix MCP when a repository task benefits from indexed evidence:
  codebase orientation, symbol/source search, dependency or call graphs, change
  impact, API/event tracing, architecture checks, Git/coverage evidence,
  duplicates, dead-code review, or semantic context. Skip it for trivial
  single-file edits or when a known source file and native tests already answer
  the task.
---

# Weavatrix

Use Weavatrix on demand as a compact evidence layer. It is most useful when a
question crosses files, symbols, modules, revisions, repositories, or runtime
contracts. Do not call it merely because the server is available.

## Minimal workflow

1. Call `graph_stats` to confirm the active repository and graph revision.
2. Use `module_map` for orientation or `search_code` for a known literal.
3. Pin decisive evidence with `inspect_symbol`, `context_bundle`, or
   `read_source`.
4. Expand only when needed: `get_dependents` or `change_impact` for risk,
   `trace_endpoint` or `trace_api_contract` for runtime contracts,
   `verify_architecture` for policy, and `run_audit` for a broad health pass.
5. Use repository-native tests or benchmarks for behavioral proof.

Prefer `output_format:"text"` and a small `token_budget` for conversational
work. Use JSON only for automation or retained evidence. Call `rebuild_graph`
only when the repository changed before automatic refresh completed or when
deliberately changing graph mode.

Read [references/tool-routing.md](references/tool-routing.md) only when choosing
among similar tools, tracing cross-repository transports, or interpreting
audit and coverage results.

## Evidence and safety

- Keep source spans, graph revision, relation type, extractor, and confidence
  attached to findings.
- Treat static reachability and audit output as candidates, not runtime proof.
- Preserve exact transport identity; do not merge Kafka, AMQP/RabbitMQ, NATS,
  SNS/SQS, JMS, GraphQL, and gRPC evidence because operation names match.
- The core is local, offline, and read-only. Use `weavatrix-refactor` only for
  an explicitly approved write plan and `weavatrix-online` only for explicitly
  approved network work.
