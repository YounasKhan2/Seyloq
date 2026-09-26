# ADR-006: Durable Outbox and Reconciliation

## Status

Accepted for SEY-003 implementation.

## Decision

Sending a message is a local transaction:

1. Insert or update the local message.
2. Insert the durable outbox operation with the same logical idempotency identity.
3. Commit.
4. Notify the UI from local state.
5. Let the sync processor attempt transport and reconcile later.

The message can render as soon as the local transaction succeeds. Transport success is not required for local visibility.

## State Model

SEY-003 separates local sync state from recipient delivery/read state.

Local sync state:

- `local`
- `queued`
- `sending`
- `acknowledged`
- `failed`

Recipient-facing delivery state:

- `pending`
- `sent`
- `delivered`
- `read`
- `failed`

This avoids using a read receipt icon to mean outbox durability or backend acknowledgement.

## Operation Schema

The initial operation is intentionally narrow: `message.send`.

An outbox operation stores:

- stable operation ID
- operation type
- entity type and entity ID
- conversation ID
- payload JSON
- idempotency key
- attempt count
- next eligible attempt time
- created and updated timestamps
- status
- last error

## Retry and Failure

Retryable failures keep the message and operation durable, increment attempts, and schedule a bounded retry. Offline/unavailable transport is retryable. Malformed or fatal operations become non-retryable and must not loop forever.

## Reconciliation

Acknowledgement updates the existing local message with server metadata such as accepted timestamp and server sequence. It must not insert a duplicate. This is the core SEY-003 acceptance property and prepares SEY-004 to add real backend acknowledgements.
