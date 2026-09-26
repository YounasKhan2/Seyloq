# ADR-010: Message Submission, Idempotency and Acknowledgement Protocol

## Status

Proposed for SEY-004 human review.

## Decision

Use HTTP for command submission and WebSocket for realtime fan-out, sync notifications, and catch-up hints. The sync engine may submit over HTTP even while a WebSocket is connected. Realtime delivery is an optimization, not the source of durability.

Every submitted operation carries a stable `operationId` and `idempotencyKey`. The server transaction deduplicates by `(senderDeviceId, idempotencyKey)`, persists exactly one logical mutation, records the operation result, assigns authoritative conversation ordering, and returns/replays the same acknowledgement for retries.

## Submission Envelope

Minimal `SendMessage` request:

```json
{
  "protocolVersion": 1,
  "operationId": "uuidv7",
  "idempotencyKey": "uuidv7",
  "messageId": "uuidv7",
  "conversationId": "uuidv7",
  "senderUserId": "uuidv7",
  "senderDeviceId": "uuidv7",
  "clientCreatedAt": "2026-09-27T10:00:00.000Z",
  "messageType": "text",
  "content": { "text": "..." },
  "replyToMessageId": null,
  "attachments": [],
  "schemaVersion": 1
}
```

Client-generated and immutable: `operationId`, `idempotencyKey`, `messageId`, `clientCreatedAt`.

Server-validated: user, device, session, conversation membership, content schema, attachment references.

Server-generated authoritative metadata: `serverSequence`, `serverAcceptedAt`, server-side membership/delivery fan-out.

## Acknowledgement Envelope

```json
{
  "protocolVersion": 1,
  "operationId": "uuidv7",
  "messageId": "uuidv7",
  "accepted": true,
  "serverSequence": 1842,
  "serverAcceptedAt": "2026-09-27T10:00:01.100Z",
  "error": null
}
```

Rejected operations return the same `operationId` and `messageId` where possible, plus a stable error code and retryability.

## Server Transaction Boundary

One transaction must:

1. Validate session, device and conversation membership.
2. Check idempotency key uniqueness in the sender device scope.
3. If duplicate with identical payload hash, return the stored operation result.
4. If duplicate with different payload hash, reject as `conflict`.
5. Persist message.
6. Assign conversation-local `serverSequence`.
7. Record operation result.
8. Commit.

PostgreSQL `UNIQUE` constraints and `INSERT ... ON CONFLICT` provide the foundation for deduplication. PostgreSQL transactions provide the commit/rollback boundary.

## Ordering

UUIDv7 order is not authoritative message order.

Authoritative order is per conversation:

- `serverSequence`: monotonically increasing integer per conversation.
- `serverAcceptedAt`: advisory server timestamp.
- `clientCreatedAt`: local optimistic display hint.
- `messageId`: stable tie-breaker before server acknowledgement.

Offline local messages render optimistically by local order. After acknowledgement, clients reconcile existing messages into `serverSequence` order without duplicating them.

## Error Taxonomy

Terminal:

- `unauthenticated`
- `device_revoked`
- `forbidden`
- `conversation_not_found`
- `not_member`
- `invalid_operation`
- `conflict`
- `unsupported_version`

Retryable:

- `temporarily_unavailable`
- `rate_limited` after `retryAfter`

## Evidence

RFC 9110 distinguishes protocol idempotency and explains why retrying non-idempotent requests requires application-level semantics. Seyloq's message submission is a state-changing command, so it must use explicit idempotency keys rather than assuming POST is safe to retry.

PostgreSQL supports transactions, rollback, unique constraints, and `ON CONFLICT`, which are the necessary tools for server-side idempotency and acknowledgement replay.

WebSocket APIs provide persistent bidirectional communication, but reconnect and missed-event recovery still require an explicit catch-up protocol.
