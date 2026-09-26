# ADR-004: Local Persistence Architecture

## Status

Accepted for SEY-003 implementation.

## Decision

Seyloq will use Rust-owned SQLite behind narrow application commands/use cases rather than exposing arbitrary SQL directly to React.

The React layer requests application behavior such as send message, save draft, retry message, and process outbox. It observes local state through an external-store subscription boundary. React components do not know SQL exists.

The native layer owns the long-term SQLite database, migrations, connection pragmas, and privacy-sensitive local persistence. SEY-003 proves this with native migration and outbox transaction tests while the Vite/browser preview uses the same repository/use-case contracts with a browser storage adapter.

## Alternatives Considered

### Option A: Official Tauri SQL plugin used from React

The official Tauri SQL plugin is maintained, supports SQLite, has migrations, and supports desktop plus Android. It is not currently iOS-compatible according to the plugin support table. More importantly for Seyloq, using it directly from React would make SQL a webview concern and would push business logic toward UI code.

### Option B: Rust owns SQLite and exposes purpose-built behavior

This is selected. It keeps the security boundary tighter, keeps migrations and connection ownership native, supports future secure-storage/database-encryption work better, and prevents the webview from becoming a general database client.

### Option C: Browser storage or IndexedDB as the primary architecture

Rejected as the primary architecture. It is useful for the dev preview adapter, but Seyloq is a Tauri app that needs native filesystem control, future mobile behavior, and a security posture suitable for sensitive communication data.

## SQLite Configuration

The native store enables foreign keys per connection, uses WAL mode, sets `synchronous = NORMAL`, and configures a bounded busy timeout. WAL is chosen because messenger reads should not be blocked by normal writes. Foreign keys are explicit because SQLite does not require enforcement to be on by default.

## Security Notes

SEY-003 does not implement local database encryption or E2EE. Local message data is plaintext in the selected storage. The architecture keeps plaintext database access in the native layer so future encryption and key-management decisions can be made without teaching React SQL.
