# SEY-004 Protocol Draft

## Scope

This draft defines Seyloq's next architecture target. It is not an implementation plan for this milestone.

## Sources Consulted

- RFC 9562: UUIDs, including UUIDv7.
- RFC 9110: HTTP semantics and idempotency.
- Tauri v2 documentation: commands, capabilities, permissions, async commands, events, channels and mobile plugin lifecycle.
- PostgreSQL documentation: `uuid` type, transactions, unique constraints, `INSERT ... ON CONFLICT`.
- PostgreSQL documentation: Read Committed isolation and unique-index concurrency checks.
- SQLite documentation: storage classes, foreign keys and WAL.
- OWASP MASVS/MASTG storage guidance.
- Maintained UUID/ULID ecosystem docs for TypeScript, Rust and Go.
- MDN WebSocket documentation.

Reference URLs:

- https://www.rfc-editor.org/rfc/rfc9562.html
- https://www.rfc-editor.org/rfc/rfc9110.html
- https://v2.tauri.app/develop/calling-rust/
- https://tauri.app/security/capabilities/
- https://tauri.app/security/permissions/
- https://www.postgresql.org/docs/current/datatype-uuid.html
- https://www.postgresql.org/docs/current/sql-insert.html
- https://www.postgresql.org/docs/current/tutorial-transactions.html
- https://www.postgresql.org/docs/current/transaction-iso.html
- https://www.postgresql.org/docs/current/index-unique-checks.html
- https://www.sqlite.org/datatype3.html
- https://www.sqlite.org/foreignkeys.html
- https://www.sqlite.org/wal.html
- https://mas.owasp.org/MASVS/controls/MASVS-STORAGE-1/
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- https://docs.rs/uuid/latest/uuid/
- https://pkg.go.dev/github.com/google/uuid
- https://github.com/ulid/spec
- https://github.com/oklog/ulid

## Entity Model

```text
User
  Device
    Session
      Connection

Conversation
  Membership(User)
  Message
  Attachment
  LiveObject

Client
  Local SQLite
  OutboxOperation
  SyncCursor
```

Messages are authored by users and produced by devices. Membership authorizes the user. Device/session authorization authorizes the submitting client.

## Identifier Strategy

Use UUIDv7 for protocol-visible durable entities. Use canonical lowercase text over JSON and logs. Use PostgreSQL `uuid`. Use SQLite `BLOB` for compact 16-byte storage where practical.

All entity classes use UUIDv7 unless a future product/security decision needs a different class:

- user
- device
- session
- conversation
- message
- outbox operation
- attachment
- Live Object

Identity is not ordering. UUIDv7 improves locality and optimistic sorting, but message ordering is assigned by the server.

## Native Client Ownership

Rust owns:

- SQLite connection and migrations
- local durable repositories
- outbox processor
- local reconciliation
- secure storage access
- sync loop
- command permissions/capabilities

React owns:

- rendering
- navigation
- composer UI state
- selection, menus and popovers
- invoking use-case commands
- subscribing to native state streams

Browser preview remains development/demo-only. Seyloq is not committing to a production browser client in this architecture gate. A real browser client would need a separate persistence/security architecture.

## Command, Event and Channel Use

Commands are request/response use cases: send, retry, load, save draft, mark read.

Events are low-frequency invalidation and status notifications: connectivity, sync state, device revoked.

Channels are high-volume or long-lived streams: message hydration, catch-up batches, upload progress, diagnostics.

## Submission State Transitions

```text
draft
  -> locally_persisted
  -> queued
  -> submitted
  -> server_accepted
  -> delivered_to_recipient_device
  -> read_by_recipient
```

`locally_persisted` means the local message and outbox operation committed. `server_accepted` means the backend committed and assigned authoritative ordering. `delivered` and `read` are recipient-device/user state, not outbox state.

## SendMessage Envelope

Required:

- `protocolVersion`
- `operationId`
- `idempotencyKey`
- `messageId`
- `conversationId`
- `senderUserId`
- `senderDeviceId`
- `clientCreatedAt`
- `messageType`
- `content`
- `schemaVersion`

Optional:

- `replyToMessageId`
- `attachments`
- type-specific Live Object references in later phases

The client generates message and operation identity. The server validates authorization and schema.

The server derives the authenticated user, device and session from the request/session context. `senderUserId` and `senderDeviceId` in the envelope are consistency checks against that context, not trusted authority. A malicious client cannot become another user or device by editing JSON.

## Acknowledgement Envelope

Required:

- `protocolVersion`
- `operationId`
- `messageId`
- `accepted`

On success:

- `serverSequence`
- `serverAcceptedAt`

On failure:

- `errorCode`
- `retryable`
- `retryAfter` when useful

An ACK must identify the durable local operation it reconciles. A successful ACK updates the existing local message and outbox operation in one native transaction.

## Idempotency

Scope idempotency keys by `senderDeviceId`.

The server records:

- `senderDeviceId`
- `idempotencyKey`
- `operationId`
- operation type
- payload hash
- lifecycle status
- message ID
- server sequence after success
- operation result
- creation and completion timestamps
- expiry/retention metadata

Same key and same payload returns the stored acknowledgement. Same key and different payload returns `conflict`. Concurrent duplicates race on the unique constraint; exactly one creates the mutation and the other receives/replays the result.

`operationId` is the durable identity of the client operation that the ACK reconciles. `idempotencyKey` is the server deduplication identity scoped to the sender device. They may be the same UUIDv7 in early implementations, but the protocol keeps both concepts distinct.

Minimal lifecycle:

```text
processing
  -> completed
```

The idempotency row is claimed inside the same transaction that persists the message and final ACK. If that transaction aborts, the claim is rolled back too.

PostgreSQL compatibility requirement:

1. Attempt to insert the `(senderDeviceId, idempotencyKey)` idempotency row with payload hash.
2. If the insert succeeds, this transaction owns the mutation.
3. If a concurrent uncommitted transaction already inserted that unique key, PostgreSQL unique-index checking waits for that transaction to finish and then rechecks.
4. If the first transaction commits, the duplicate follows the conflict path and re-reads the committed idempotency result in a subsequent statement/transaction.
5. If the first transaction aborts, no committed conflicting row exists, so the duplicate may safely claim the key and become the operation owner.

Retention must be long enough to cover Seyloq's supported offline/retry window. Exact duration remains open for product/storage policy. Once the server permanently forgets an idempotency record, replay guarantees for that operation can no longer depend on that record alone.

## Server Transaction

```text
BEGIN
  authenticate session
  validate device active
  validate membership
  claim/check operation idempotency record
  store operationId, operation type and payload hash
  insert message
  assign conversation serverSequence
  record final ACK/result payload
  mark operation completed
COMMIT
```

If ACK delivery fails after commit, retry returns the stored ACK and does not create another message.

The idempotency claim, message row, authoritative `serverSequence` and final ACK/result become durable together. A duplicate or failed operation must not independently create another message or obtain a distinct authoritative sequence.

## Ordering Model

Authoritative ordering is per conversation by `serverSequence`.

Optimistic local order before ACK:

1. local pending messages by local creation order
2. acknowledged messages by `serverSequence`
3. stable message ID as tie-breaker

After ACK, the local message is reconciled into server order. `clientCreatedAt` remains advisory.

## Realtime and Catch-Up

Use HTTP for command submission and catch-up requests. Use WebSocket for realtime fan-out and low-latency notifications.

Catch-up needs a cursor. Recommended first cursor:

```text
accountDeviceEventCursor
```

Each accepted mutation creates sync events for affected user devices. A reconnecting device asks for events after its last durable cursor. Conversation-specific `serverSequence` remains the message ordering authority inside each conversation.

## Multi-Device Walkthrough

User owns Phone A, Laptop B and Tablet C.

Phone A sends M1:

1. Phone A writes message and outbox locally.
2. Phone A submits `SendMessage` with user, device, operation and message IDs.
3. Server validates session, active device and membership.
4. Server deduplicates idempotency key.
5. Server commits message, assigns `serverSequence`, stores ACK and sync events.
6. ACK reconciles Phone A's local message.
7. WebSocket fan-out notifies recipient devices and the user's Laptop B and Tablet C.
8. B and C fetch/apply sync events and insert M1 by message ID.
9. Duplicate realtime/catch-up arrivals collapse by message ID and event cursor.
10. Delivery/read states are separate recipient-device/user events.

## Offline Walkthrough

Phone A offline creates M1, M2 and M3. They are locally persisted and queued with stable operation IDs.

Laptop B sends M4 online. Server assigns M4 the next conversation `serverSequence`.

Phone A reconnects:

1. Phone A submits queued operations in local order.
2. Server assigns later `serverSequence` values to M1-M3.
3. Phone A receives ACKs and reorders acknowledged messages by server sequence.
4. Phone A catch-up also receives M4 and inserts it by ID.
5. Laptop B receives M1-M3 through realtime or catch-up.

Temporary UI order can differ while offline. Server sequence becomes authoritative after reconciliation.

## Lost ACK Walkthrough

Client sends M1. Server commits M1 and stores ACK. Network drops before ACK reaches client. Client retries the same operation with the same idempotency key. Server finds the existing operation result and replays the ACK. Client reconciles the existing local M1; no duplicate message is created.

Final state:

- one logical message
- one `messageId`
- one `serverSequence`
- one logical operation
- one stored acknowledgement replayed as needed

## Concurrent Retry Walkthrough

Two identical submissions for the same operation arrive concurrently.

Request A attempts to insert the idempotency row for `(senderDeviceId, idempotencyKey)`. Request B attempts the same insert while A's transaction is still open.

PostgreSQL unique-index semantics provide the serialization point: B waits for A's transaction outcome and the uniqueness check is repeated.

If A commits:

1. A's transaction has durably stored the idempotency claim, message, `serverSequence` and ACK/result.
2. B cannot insert a second row for the same unique key.
3. B reads the committed idempotency row/result.
4. If B's payload hash matches A's, B replays the same ACK.
5. Committed messages remain 1.

If A aborts:

1. A's idempotency claim and partial mutation disappear.
2. B's insert may proceed because no committed conflict exists.
3. B can become the successful owner and perform the one mutation.

If B has the same key but a different payload hash after A commits, B returns `conflict`. It must not overwrite A, reinterpret the key as new, or create another message.

## Security Classification

SQLite:

- messages and Live Object plaintext until E2EE/database encryption is implemented
- conversation summaries
- outbox operation metadata and payloads
- sync cursors
- non-secret local state

OS secure storage:

- refresh/session tokens
- device private credentials
- future E2EE identity keys
- future database encryption key material

Never claim E2EE or encrypted local storage until implemented.

## Threat Model

Compromised webview/frontend code: mitigate by narrow Tauri commands, no SQL IPC, least-privilege capabilities, and native validation.

Stolen session token: mitigate with device-bound sessions, rotation, expiry and revocation.

Replayed send request: mitigate with scoped idempotency keys and stored operation results.

Duplicated operation: mitigate with unique constraints and ACK replay.

Revoked device: backend rejects new operations and emits revocation sync.

Local DB copied from disk: current plaintext limitation; future database encryption/key storage required.

Manipulated client clock: server sequence and server timestamp are authoritative.

Maliciously altered payload: backend validates schema, membership and payload hash for idempotency.

Stale conversation membership: server validates current membership at submission time.

Unauthorized conversation submission: reject as `forbidden` or `not_member`.

## Backend Shape

Start with a Go modular monolith:

```text
Go API / Realtime app
  Identity
  Devices/Sessions
  Conversations
  Messaging
  Sync
  PostgreSQL
```

Separate realtime gateway only when load or operational evidence requires it. Do not start with Kafka, Kubernetes, service mesh or many microservices.

## Protocol Versioning

Use independent versions:

- `protocolVersion`
- operation `schemaVersion`
- Live Object `schemaVersion`

Do not couple protocol compatibility to app release version.

## Error Model

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
- `rate_limited`

Clients keep durable outbox operations for retryable errors and mark terminal errors clearly without deleting local user content.

## Recommended Implementation Sequence

1. Replace temporary IDs with UUIDv7 in TypeScript and Rust.
2. Add native Tauri commands/capabilities for local repository use cases.
3. Implement user/device/session local contracts and secure-storage placeholders.
4. Add Go modular monolith skeleton with PostgreSQL and UUIDv7.
5. Implement HTTP message submission with idempotency and ACK replay.
6. Add WebSocket fan-out and catch-up cursor.
7. Add delivery/read receipts.

Do not implement backend or realtime before identity/device/session foundations.

## Open Questions

- Exact idempotency retention duration.
- Whether first sync cursor should be account-device only or paired with conversation-specific cursors from day one.
- Product policy for revoked devices with unsent offline messages.
- Exact secure storage plugin/provider choice for each platform.
