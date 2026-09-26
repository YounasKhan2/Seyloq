# ADR-010: Message Submission, Idempotency and Acknowledgement Protocol

## Status

Proposed for SEY-004 human review.

## Decision

Use HTTP for command submission and WebSocket for realtime fan-out, sync notifications, and catch-up hints. The sync engine may submit over HTTP even while a WebSocket is connected. Realtime delivery is an optimization, not the source of durability.

Every submitted operation carries a stable `operationId` and `idempotencyKey`. The server transaction deduplicates by `(senderDeviceId, idempotencyKey)`, persists exactly one logical mutation, records the operation result, assigns authoritative conversation ordering, and returns/replays the same acknowledgement for retries.

The authenticated request/session context is authoritative for user, device and session identity. Envelope fields such as `senderUserId` and `senderDeviceId` are validated against that context; they are not trusted identity claims by themselves.

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

`operationId` is the durable identity of the client operation. `idempotencyKey` is the server deduplication identity in the sender-device scope. They may initially carry the same UUIDv7 value, but the protocol keeps both names because they answer different questions: which local operation is reconciled, and which server-side retry group must collapse to one result.

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
2. Claim `(senderDeviceId, idempotencyKey)` with a unique idempotency operation record.
3. Store operation identity, operation type and payload hash with the claim.
4. Persist message.
5. Assign conversation-local `serverSequence`.
6. Store the final acknowledgement/result payload on the idempotency record.
7. Mark the idempotency record completed.
8. Commit.

PostgreSQL `UNIQUE` constraints and `INSERT ... ON CONFLICT` provide the foundation for deduplication. PostgreSQL transactions provide the commit/rollback boundary.

The successful operation transaction owns the idempotency claim, message persistence, server sequence assignment and stored acknowledgement. These cannot become independently durable.

## Idempotency Claim Concurrency

Conceptual server-side idempotency record:

```text
IdempotencyOperation

senderDeviceId
idempotencyKey
operationId
operationType
payloadHash
status
messageId
serverSequence
resultPayload
createdAt
completedAt
```

Minimum lifecycle:

```text
processing
  -> completed
```

The `processing` row is created inside the same transaction that will persist the message and final result. If that transaction aborts, the claim disappears with it.

PostgreSQL enforces unique constraints with unique indexes. If another transaction has inserted a conflicting unique key but has not committed, the would-be inserter waits for that transaction to finish and then repeats the uniqueness check. Under Read Committed, `INSERT ... ON CONFLICT DO NOTHING` can decide not to insert because of a concurrent transaction whose row was not visible to the statement snapshot; the duplicate handler must then issue a subsequent read for the winning idempotency row/result.

Chosen strategy:

1. Try to insert the idempotency record for `(senderDeviceId, idempotencyKey)` and payload hash.
2. If the insert succeeds, this transaction owns the claim and performs the message mutation, sequence assignment and ACK storage before commit.
3. If the insert does not happen because the key already exists, read the committed idempotency record/result in a subsequent statement/transaction.
4. If the payload hash matches and the record is completed, replay `resultPayload`.
5. If the payload hash differs, return `conflict`.
6. If the first claimant aborted, the duplicate insert may safely become the successful claimant because no committed conflicting row exists.

For a given `(senderDeviceId, idempotencyKey)`, at most one logical mutation may commit. Concurrent duplicate callers resolve through the same idempotency record and must never independently execute the message mutation.

Same key and same payload means the same logical operation: same message, same `serverSequence`, same stored acknowledgement. Same key and different payload means `conflict`; the second request must not overwrite or reinterpret the first operation.

## Ordering

UUIDv7 order is not authoritative message order.

Authoritative order is per conversation:

- `serverSequence`: monotonically increasing integer per conversation.
- `serverAcceptedAt`: advisory server timestamp.
- `clientCreatedAt`: local optimistic display hint.
- `messageId`: stable tie-breaker before server acknowledgement.

Offline local messages render optimistically by local order. After acknowledgement, clients reconcile existing messages into `serverSequence` order without duplicating them.

Sequence allocation mechanics are intentionally deferred, but the invariant is fixed: one committed logical message equals one authoritative `serverSequence`. Failed duplicate or conflicting operations must not allocate independent message rows or authoritative sequence values.

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

PostgreSQL unique-index checks wait for uncommitted conflicting inserts to commit or roll back, then recheck. PostgreSQL Read Committed statements do not see uncommitted rows; `INSERT ... ON CONFLICT DO NOTHING` may still avoid inserting because of a concurrent transaction, so duplicate resolution must re-read the winning record/result after the conflict path completes.

WebSocket APIs provide persistent bidirectional communication, but reconnect and missed-event recovery still require an explicit catch-up protocol.
