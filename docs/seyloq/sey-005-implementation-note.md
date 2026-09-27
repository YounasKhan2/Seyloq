# SEY-005 Implementation Note

## Scope

SEY-005 moves Seyloq's local messaging foundation toward the approved native architecture without adding production backend, realtime, authentication or E2EE.

## UUIDv7

New durable message and outbox operation IDs are UUIDv7.

Protocol/application representation is canonical lowercase UUID text. TypeScript uses the `uuid` package and Rust uses the `uuid` crate with UUIDv7 support. Seed UI fixtures intentionally keep readable IDs such as `m1` and `hunza-trip`; those remain development/test fixture keys, not the production identity contract.

UUIDv7 is not authoritative message ordering. Local pending messages still use local optimistic ordering, and future acknowledged ordering remains `serverSequence`.

## Native Command Surface

The Tauri boundary exposes typed application use cases:

- `initialize_local_store`
- `load_conversation`
- `load_messages`
- `send_message`
- `retry_operation`
- `edit_message`
- `delete_message`
- `toggle_reaction`
- `save_draft`
- `load_draft`
- `mark_read`
- `load_sync_status`
- `apply_fake_acknowledgement`

There is no generic SQL IPC and no repository-shaped command such as `insert_message` or `update_outbox`.

## Adapter Composition

Runtime selection is centralized in the TypeScript application composition boundary.

```text
React
  -> TS application contract
  -> TauriNativeAdapter in Tauri
  -> typed Tauri command
  -> Rust local use case
  -> SQLite
```

Browser development mode uses `BrowserStorageLocalRepository` behind the same relevant local-first contract. It remains useful for UI development, browser preview and tests, but it is not the production persistence architecture.

## Native Module Architecture

The Rust native side is organized as:

```text
src/
  lib.rs
  commands/
    local_state.rs
    messaging.rs
  application/
    messaging.rs
  domain/
    errors.rs
    models.rs
  local_store/
    database.rs
    migrations.rs
    repository.rs
    seed.rs
```

`lib.rs` owns Tauri composition, managed state and command registration. Commands deserialize typed input and perform boundary validation. The application layer owns use-case intent. The local store owns SQLite opening, migrations, row mapping and durable transactions.

## Identity Contracts

The TypeScript domain layer now distinguishes:

- `User`
- `Device`
- `Session`
- runtime `Connection`

Device status can represent active, inactive and revoked states. Session remains separate from durable device identity. Runtime connection state is not persisted as identity.

The native SQLite schema also seeds minimal local user, device and session rows so message authorship can carry `authorUserId` and `originDeviceId`.

## Persistence Ownership

Rust owns the native SQLite connection, migrations, local transactions, message/outbox atomic send and acknowledgement reconciliation. React does not receive SQL access.

The native send transaction persists:

```text
message
+ outbox operation
```

The fake acknowledgement command reconciles:

```text
message acknowledged metadata
+ outbox succeeded state
```

in one local transaction.

## Messaging Interaction Semantics

The production Tauri adapter no longer exposes silent no-ops for currently reachable messaging interactions.

- `editMessage` calls `edit_message`, validates the target exists and is locally editable, updates text and marks the message edited.
- `deleteMessage` calls `delete_message`, validates the target exists and removes the local message.
- `toggleReaction` calls `toggle_reaction`, validates the target exists and persists the local reaction state.

The TypeScript application contract returns promises for these operations. If an awaited operation resolves, the mutation happened. Missing native targets return structured errors instead of pretending success.

## Secure Storage Boundary

SEY-005 defines a TypeScript `SecureCredentialStore` interface for future session credentials, device private credentials, E2EE key material and database-encryption keys.

No secure-storage provider is implemented in this milestone, and no fake secret material is stored in SQLite.

## Deferred

- real authentication
- OS secure credential storage implementation
- Go backend
- PostgreSQL schema
- HTTP message submission
- server idempotency records
- WebSocket realtime
- sync cursor implementation
- push notifications
- E2EE
- calls/media infrastructure
