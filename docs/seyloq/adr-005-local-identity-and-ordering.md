# ADR-005: Local Identity and Ordering

## Status

Accepted for SEY-003 implementation.

## Decision

Locally created durable entities receive client-generated, time-ordered, collision-resistant IDs before any transport call.

SEY-003 uses prefixed monotonic IDs in the application layer:

- `msg_...` for messages
- `op_...` for outbox operations

The ID value is also used as the send idempotency identity for message sends. Retrying a send reuses the same message ID and idempotency key.

## Rationale

The researched options were UUIDv7 and ULID-style identifiers. UUIDv7 is standardized in RFC 9562 and uses a Unix millisecond timestamp in the high bits with random uniqueness bits. ULID is compact, URL-safe, and lexicographically sortable. Both satisfy Seyloq's offline generation and future multi-device needs.

For SEY-003, the project uses a small internal monotonic generator with the same operational properties needed by the current tests and local ordering contract. Before public protocol compatibility or server storage is finalized, SEY-004 should either formalize UUIDv7 or adopt a well-maintained ULID/UUIDv7 implementation across TypeScript, Rust, and Go.

## Ordering Contract

Local message order is deterministic by conversation, `createdAt`, and stable message ID. This is not the future cross-device authority. Future server acknowledgement can add `serverSequence` and accepted timestamps to reconcile ordering without replacing the local logical message.

Client wall-clock time is useful for optimistic local order, but it is not treated as global truth.
