# ADR-008: Tauri Native Application Boundary

## Status

Proposed for SEY-004 human review.

## Decision

Use application/use-case commands at the React to Rust boundary. Do not expose repository-shaped SQL commands or generic database execution.

React owns product UI, navigation, composer state, selection, menus, and rendering. Rust owns SQLite, migrations, native-local repository implementations, outbox persistence, local reconciliation, credential access, and the durable sync loop.

## Boundary Model

Commands are for user-initiated request/response use cases:

- `load_conversation`
- `load_messages`
- `send_message`
- `retry_operation`
- `save_draft`
- `mark_read`
- `load_sync_status`

Events are for low-frequency state notifications:

- connectivity changed
- sync status changed
- conversation summary changed
- auth/device revoked

Channels are for long-lived or high-volume streams:

- initial conversation hydration
- incremental message/catch-up stream
- outbox processor diagnostics in development
- future upload progress

## Evidence

Tauri documentation recommends asynchronous commands for heavy work so the UI does not freeze. Tauri capabilities and permissions provide a least-privilege security model where commands are explicitly available to selected windows/webviews. Capabilities merge when assigned to the same window, so Seyloq should keep the main app capability small and avoid broad native surfaces.

Tauri v2 supports commands, managed state, events, channels, and mobile plugin lifecycle hooks. Mobile plugin documentation shows lifecycle events such as plugin load and Android `onNewIntent`; future background sync and notifications will need native-aware ownership rather than React-only orchestration.

## Alternatives

### Fine-Grained Repository Commands

Rejected. Commands such as `insert_message`, `update_outbox`, or `load_outbox` increase IPC count, leak persistence shape, and make it easier for compromised webview code to assemble unintended state transitions.

### Generic SQL Commands

Rejected. `execute_sql` and `query_sql` collapse the security boundary and contradict SEY-003's Rust-owned SQLite decision.

### React-Owned Sync

Rejected as the long-term owner. React can request sync and display state, but Rust should own durable sync orchestration because it owns SQLite transactions, native lifecycle, future secure storage access, and crash recovery.

## Trade-Offs

Use-case commands are less flexible than generic repositories, but they reduce compromise blast radius and keep domain rules close to durable state.

Rust-owned sync adds native complexity but avoids excessive IPC and prepares for mobile lifecycle, network changes, and future E2EE key access.

## Future Consequences

SEY-005 should expose a minimal set of commands and event/channel streams. Each command should have a Tauri permission and a capability entry rather than relying on default broad command exposure.
