# `trace_api_contract`

Cross-repository HTTP, GraphQL, gRPC and event-transport contract evidence.

## When to use

Trace cross-repository HTTP, GraphQL, gRPC, or concrete event-transport contract evidence.

Keep Kafka, AMQP/RabbitMQ, NATS, SNS/SQS, JMS, GraphQL, and gRPC identities distinct.

## Inputs

- `backend` (string, required).
- `clients` (array<string>, required).
- `auto_discover_wrappers` (boolean).
- `changed_files` (array<string>).
- `client_names` (array<string>).
- `client_wrappers` (object).
- `cursor` (string).
- `include_classified` (boolean).
- `include_tests` (boolean).
- `max_affected_files` (integer, min 0).
- `max_endpoints` (integer, min 0).
- `max_impact_depth` (integer, min 0).
- `max_matches` (integer, min 0).
- `max_source_file_bytes` (integer, min 0).
- `max_source_files` (integer, min 0).
- `method` (string).
- `output_format` ("text" | "json" | "structured", default "json") — text returns the concise text block only; json returns structured output and mirrors it into text for clients that read only content; structured drops that mirror, which is the larger copy, and is safe only where the client reads structuredContent.
- `page_size` (integer, min 0).
- `path` (string).
- `per_item_limit` (integer, min 0).
- `response_detail` ("compact" | "full").
- `runtime_config` (object).
- `runtime_evidence_files` (object).
- `runtime_evidence_max_age_hours` (integer, min 0).
- `top_n` (integer, min 0).
- `transport` ("all" | "http" | "graphql" | "grpc" | "event").

## Minimal call

```json
{
  "name": "trace_api_contract",
  "arguments": {
    "backend": "<value>",
    "clients": ["<value>"],
    "output_format": "text"
  }
}
```

Use `output_format:"text"` for compact agent interaction. The live MCP
`tools/list` schema remains authoritative for this installed version.
