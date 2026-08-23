# Languages and repository surfaces

The native registry recognizes 24 named source surfaces across 65 registered
extensions. Support is evidence-specific: lossless source recovery does not
pretend to provide the same semantic depth as a typed adapter.

## Code and schema adapters

| Surface | Evidence extracted |
| --- | --- |
| Rust | modules, `use`/re-exports, items, impl ownership, traits, calls, tests, Axum/Actix/Rocket-style routes |
| JavaScript / JSX | ESM/CommonJS imports and exports, declarations, members, calls, routes, event clients |
| TypeScript / TSX | JavaScript evidence plus interfaces, type-only coupling, aliases, and typed member ownership |
| Python | imports, declarations, classes, calls, decorators, framework routes, and messaging |
| Go | packages, imports, declarations, receivers, calls, HTTP, and gRPC evidence |
| Java | packages, classes, methods, inheritance, Spring endpoints, JMS, and event clients |
| C# | namespaces, types, members, calls, attributes, and routes |
| C | includes, declarations, functions, and calls |
| C++ | C evidence plus namespace and class structure |
| SQL | schemas, tables, fields, statements, and host references |
| Bash / Zsh | commands, functions, variable references, and script structure |
| Swift | same-module files, imports, types, heritage, calls, and URLSession/WebSocket client routes |
| Solidity | contracts, functions, events, and calls |

## Contracts and configuration

| Surface | Evidence extracted |
| --- | --- |
| GraphQL | schema types, fields, root operations, executable calls, fragments, and referenced return types |
| Protobuf / gRPC | packages, messages, enums, services, RPC types, and unary/client/server/bidirectional streaming modes |
| JSON / JSONC | lossless syntax plus package, compiler, architecture, and application configuration |
| YAML / Kubernetes | documents, resources, services, workloads, images, ports, and configuration links |
| Terraform / HCL | blocks, resources, providers, variables, outputs, references, and deployment evidence |
| XML | elements, attributes, configuration structure, and recognized build/application manifests |

## Documents and UI sources

| Surface | Evidence extracted |
| --- | --- |
| HTML / Vue / Svelte | lossless markup, elements, attributes, embedded links, and component context |
| CSS / SCSS / Sass / Less | selectors, declarations, imports, variables, and lossless style syntax |
| Markdown / MDX | headings, links, code fences, embedded JSX boundaries, and document structure |
| reStructuredText | sections, directives, links, and source-preserving document structure |
| AsciiDoc | sections, attributes, includes, links, and source-preserving document structure |

## Cross-surface evidence

Operation passes connect source facts to repository domains:

- HTTP route handlers, mount chains, clients, and cross-repository contracts;
- GraphQL operations and referenced schema types;
- Protobuf messages, gRPC services, methods, and streaming modes;
- Kafka, RabbitMQ/AMQP, JMS, NATS, SQS, and SNS producers, consumers, topics,
  queues, exchanges, and bindings;
- MongoDB usage, package manifests, lockfiles, architecture contracts, and
  measured coverage artifacts.

## Precision boundary

Parsed syntax, manifests, and exact spans are deterministic. Cross-file
resolution uses language scope, imports, aliases, ownership, re-export chains,
module paths, and callable kinds.

Dynamic dispatch that cannot be proved stays unresolved. An ambiguous name is
not connected to an arbitrary same-named symbol. Static reachability is not
reported as measured coverage, and absent optional evidence stays absent.

## Lossless guarantee

`weavatrix-parse` preserves every source byte in its token stream. Release
tests assert byte-for-byte round trips, malformed-input behavior, exact fact
spans, real-repository digests, GraphQL/Protobuf fixtures, and integration
through the engine.
